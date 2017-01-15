---
layout: default
title: Sending Messages
subtitle: So you want to send a message...
---

While the concept of _send_ is widely understood, MassTransit stereotypes send as a very specific approach for producing messages. With send, a message is delivery to a specific endpoint using an explicit destination address, an address of which the producer has apriori knowledge.

* ToC
{:toc}

## Sending a message

Sending a message to an endpoint requires an `ISendEndpoint` reference, which can be obtained from any send endpoint provider (an object that supports `ISendEndpointProvider`). The application should always use the nearest source to obtain the send endpoint, and it should do it every time the application needs it -- the application should not cache the send endpoint reference.

For instance, an `IBus` instance is a send endpoint provider, but it should _never_ be used by a consumer to obtain an `ISendEndpoint. `ConsumeContext` can also provide send endpoints, and should be used since it is _closer_ to the consumer.

> This cannot be stressed enough -- always get send endpoints from the closest interface to the application code. There is extensive logic to tie message flows together using conversation, correlation, and initiator identifiers. By skipping a level and going outside the closest scope, that information can be lost which prevents the useful trace identifiers from being properly handled.

To obtain a send endpoint from a send endpoint provider, use the GetSendEndpoint() method as shown below. Once the send endpoint is returned, it can be used to a send a message.

{% highlight C# %}
public async Task SendOrder(ISendEndpointProvider sendEndpointProvider)
{
    var endpoint = await sendEndpointProvider.GetSendEndpoint(_serviceAddress);

    await endpoint.Send(new SubmitOrder(...));
}
{% endhighlight %}

There are many overloads for the `Send` method. Because MassTransit is built around filters and pipes, pipes are used to customize the message delivery behavior of Send. There are also some useful overloads (via extension methods) to make sending easier and less noisy due to the pipe construction, etc.

## Sending using an interface

Since the general recommendation is to use interfaces, there are convenience methods to initialize the interface without requiring the creation of a message class underneath. While versioning of messages still requires a class which supports multiple interfaces, a simple approach to send an interface message is shown below.

{% highlight C# %}
public interface SubmitOrder
{
    string OrderId { get; }
    DateTime OrderDate { get; }
    decimal OrderAmount { get; }
}

public async Task SendOrder(ISendEndpoint endpoint)
{
    await endpoint.Send<SubmitOrder>(new
    {
        OrderId = "27",
        OrderDate = DateTime.UtcNow,
        OrderAmount = 123.45m
    });
}
{% endhighlight %}

## Setting message headers

There are a variety of message headers available which are used for correlation and tracking of messages. It is also possible to override some of the default behaviors of MassTransit when a fault occurs. For instance, a fault is normally _published_ when a consumer throws an exception. If instead the application wants faults delivered to a specific address, the `FaultAddress` can be specified via a header. How this is done is shown below.


{% highlight C# %}
public interface SubmitOrder
{
    string OrderId { get; }
    DateTime OrderDate { get; }
    decimal OrderAmount { get; }
}

public async Task SendOrder(ISendEndpoint endpoint)
{
    await endpoint.Send<SubmitOrder>(new
    {
        OrderId = "27",
        OrderDate = DateTime.UtcNow,
        OrderAmount = 123.45m
    }, context => context.FaultAddress = new Uri("rabbitmq://localhost/order_faults"));
}
{% endhighlight %}
