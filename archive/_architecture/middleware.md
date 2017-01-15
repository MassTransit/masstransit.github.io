---
layout: post
title: Middleware
subtitle: Composable middleware for the Task Parallel Library
---

## Using Middleware

MassTransit is composed of a network of pipelines, which are used to dispatch messages from the transport, through the receive endpoint, past deserialization, and ultimately to the consumers. And these pipelines are entirely asynchronous, making them very fast and very flexible.

Middleware components can be added to every pipeline in MassTransit, allowing for complete customization of message processing. And the granular ways that middleware can be applied make it easy to focus a particular behavior into a single receive endpoint, a single consumer, a saga, or the entire bus.

Middleware components are configured via extension methods on any pipe configurator (`IPipeConfigurator<T>`), and the extension methods all begin with `Use` to separate them from other methods.

* ToC
{:toc}

## Using the circuit breaker


A circuit breaker is used to protect resources (remote, local, or otherwise) from being overloaded when
in a failure state. For example, a remote web site may be unavailable and calling that web site in a
message consumer takes 30-60 seconds to time out. By continuing to call the failing service, the service
may be unable to recover. A circuit breaker detects the repeated failures and trips, preventing further
calls to the service and giving it time to recover. Once the reset interval expires, calls are slowly allowed
back to the service. If it is still failing, the breaker remains open, and the timeout interval resets.
Once the service returns to healthy, calls flow normally as the breaker closes.

Read Martin Fowler's description of the pattern [here](http://martinfowler.com/bliki/CircuitBreaker.html).

To add the circuit breaker to a receive endpoint:

{% highlight C# %}

var busControl = Bus.Factory.CreateUsingRabbitMq(cfg =>
{
    var host = cfg.Host(new Uri("rabbitmq://localhost/"), h =>
    {
        h.Username("guest");
        h.Password("guest");
    });

    cfg.ReceiveEndpoint(host, "customer_update_queue", e =>
    {
        e.UseCircuitBreaker(cb =>
        {
            cb.TrackingPeriod = TimeSpan.FromMinutes(1);
            cb.TripThreshold = 15;
            cb.ActiveThreshold = 10;
            cb.ResetInterval = TimeSpan.FromMinutes(5);
        });

        e.Consumer(() => new UpdateCustomerAddressConsumer(sessionFactory));
    });

{% endhighlight %}

There are four settings that can be adjusted on a circuit breaker.

### TrackingPeriod
The window of time before the success/failure counts are reset to zero. This is typically set to around one minute, but can be as high as necessary. More than ten seems really strange to me.

### TripThreshold
This is a percentage, and is based on the ratio of successful to failed attempts. When set to 15, if the ratio exceeds 15%, the circuit breaker opens and remains open until the ``ResetInterval`` expires.

### ActiveThreshold
This is the number of messages that must reach the circuit breaker in a tracking period before the circuit breaker can trip. If set to 10, the trip threshold is not evaluated until at least 10 messages have been received.

### ResetInterval
The period of time between the circuit breaker trip and the first attempt to close the circuit breaker. Messages that reach the circuit breaker during the open period will immediately fail with the same exception that tripped the circuit breaker.

## Using the rate limiter

A rate limiter is used to restrict the number of messages processed within a time period. The reason may be that an API or service only accepts a certain number of calls per minute, and will delay any subsequent attempts until the rate limiting period has expired.

> The rate limiter will delay message delivery until the rate limit expires, so it is best to avoid large time windows and keep the rate limits sane. Something like 1000 over 10 minutes is a bad idea, versus 100 over a minute. Try to adjust the values and see what works for you.

There are two modes that a rate limiter can operate, but only of them is currently supported (the other may come later).

To add a rate limiter to a receive endpoint:

{% highlight C# %}
var busControl = Bus.Factory.CreateUsingRabbitMq(cfg =>
{
    var host = cfg.Host(new Uri("rabbitmq://localhost/"), h =>
    {
        h.Username("guest");
        h.Password("guest");
    });

    cfg.ReceiveEndpoint(host, "customer_update_queue", e =>
    {
        e.UseRateLimit(1000, TimeSpan.FromSeconds(5));

        e.Consumer(() => new UpdateCustomerAddressConsumer(sessionFactory));
    });
});
{% endhighlight %}

The two arguments supported by the rate limiter include:

### RateLimit

The number of calls allowed in the time period.

### Interval

The time interval before the message count is reset to zero.

## Using the latest filter

The latest filter is pretty simple, it keeps track of the latest message received by the pipeline and makes that value available. It seems pretty simple, and it is, but it is actually useful in metrics and monitoring scenarios.

> This filter is actually usable to capture any context type on any pipe, so you know.

To add a latest to a receive endpoint:

{% highlight C# %}
ILatestFilter<ConsumeContext<Temperature>> tempFilter;

var busControl = Bus.Factory.CreateUsingRabbitMq(cfg =>
{
    var host = cfg.Host(new Uri("rabbitmq://localhost/"), h =>
    {
        h.Username("guest");
        h.Password("guest");
    });

    cfg.ReceiveEndpoint(host, "customer_update_queue", e =>
    {
        e.Handler<Temperature>(context => Task.FromResult(true), x =>
        {
            x.UseLatest(x => x.Created = filter => tempFilter = filter);
        })
    });
});
{% endhighlight %}

## Creating your own middleware

Middleware components are configured using extension methods, to make them easy to discover. By default, a middleware configuration method should start with Use.

An example middleware component that would log exceptions to the console is shown below.

{% highlight C# %}
Bus.Factory.CreateUsingInMemory(cfg =>
{
    cfg.UseExceptionLogger();
});
{% endhighlight %}

The extension method creates the pipe specification for the middleware component, which can be added to any pipe. For a component on the message consumption pipeline, use `ConsumeContext` instead of any `PipeContext`.

{% highlight C# %}
public static class ExampleMiddlewareConfiguratorExtensions
{
    public static void UseExceptionLogger<T>(this IPipeConfigurator<T> configurator)
        where T : class, PipeContext
    {
        configurator.AddPipeSpecification(new ExceptionLoggerSpecification<T>());
    }
}
{% endhighlight %}

The pipe specification is a class that adds the filter to the pipeline. Additional logic can be included, such as configuring optional settings, etc. using a closure syntax similar to the other configuration classes in MassTransit.

{% highlight C# %}
public class ExceptionLoggerSpecification<T> :
    IPipeSpecification<T>
    where T : class, PipeContext
{
    public IEnumerable<ValidationResult> Validate()
    {
        return Enumerable.Empty<ValidationResult>();
    }

    public void Apply(IPipeBuilder<T> builder)
    {
        builder.AddFilter(new ExceptionLoggerFilter<T>());
    }
}
{% endhighlight %}

Finally, the middleware component itself is a filter connected to the pipeline (inline). All filters have absolute and complete control of the execution context and flow of the message. Pipelines are entirely asynchronous, and expect that asynchronous operations will be performed.

> Warning
> Do not use legacy constructs such as .Wait, .Result, or .WaitAll() as these can cause blocking in the message pipeline. While they might work in same cases, you’ve been warned!

{% highlight C# %}
public class ExceptionLoggerFilter<T> :
    IFilter<T>
    where T : class, PipeContext
{
    long _exceptionCount;
    long _successCount;
    long _attemptCount;

    public void Probe(ProbeContext context)
    {
        var scope = context.CreateFilterScope("exceptionLogger");
        scope.Add("attempted", _attemptCount);
        scope.Add("succeeded", _successCount);
        scope.Add("faulted", _exceptionCount);
    }

    public async Task Send(T context, IPipe<T> next)
    {
        try
        {
            Interlocked.Increment(ref _attemptCount);

            await next.Send(context);

            Interlocked.Increment(ref _successCount)
        }
        catch (Exception ex)
        {
            Interlocked.Increment(ref _exceptionCount);

            await Console.Out.WriteLineAsync($"An exception occurred: {ex.Message}");

            // propagate the exception up the call stack
            throw;
        }
    }
}
{% endhighlight %}
