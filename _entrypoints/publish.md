---
layout: default
title: Publishing Messages
subtitle: So you want to publish a message...
---

In the previous section on sending a message, the destination address of the message needs to be known before the message can be sent. This is a sender-to-receiver pattern, typically with a single message recipient.

Publishing a message is different in that the recipients of the message are not known by the publisher. Consumers subscribe to the message type (or multiple message types) when they are configured on a receive endpoint. The underlying transport is setup to route published messages to the receive endpoint queue, which delivers a copy of the message to the consumer.

> There is no limit to the number of recipients of a published message, the only limitation may be a limit imposed by the underlying transport. In most situations, this doesn't become a bottleneck.

* ToC
{:toc}

## Publishing messages

Messages are published similarly to how messages are sent, but in this case, a single `IPublishEndpoint` is used. The same rules for endpoints apply, the nearest instance of the publish endpoint should be used. So the `ConsumeContext` for consumers, and `IBus` for applications that are publishing messages outside of a consumer context.

To publish a message, see the code below.

{% highlight C# %}
public interface OrderSubmitted
{
    string OrderId { get; }
    DateTime OrderDate { get; }
}

public async Task NotifyOrderSubmitted(IPublishEndpoint publishEndpoint)
{
    await publishEndpoint.Publish<OrderSubmitted>(new
    {
        OrderId = "27",
        OrderDate = DateTime.UtcNow,
    });
}
{% endhighlight %}

