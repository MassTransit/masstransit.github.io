(window.webpackJsonp=window.webpackJsonp||[]).push([[92],{511:function(e,t,s){"use strict";s.r(t);var a=s(34),r=Object(a.a)({},(function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[s("h1",{attrs:{id:"_7-1-4"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_7-1-4"}},[e._v("#")]),e._v(" 7.1.4")]),e._v(" "),s("p"),s("div",{staticClass:"table-of-contents"},[s("ul",[s("li",[s("a",{attrs:{href:"#broker-disconnects-reprise"}},[e._v("Broker Disconnects (reprise)")])]),s("li",[s("a",{attrs:{href:"#state-machine-request"}},[e._v("State Machine Request")])]),s("li",[s("a",{attrs:{href:"#request-client-silent-exceptions"}},[e._v("Request Client (silent) Exceptions")])]),s("li",[s("a",{attrs:{href:"#amazon-sqs"}},[e._v("Amazon SQS")])]),s("li",[s("a",{attrs:{href:"#event-hub"}},[e._v("Event Hub")])]),s("li",[s("a",{attrs:{href:"#uwp"}},[e._v("UWP")])])])]),s("p"),e._v(" "),s("h2",{attrs:{id:"broker-disconnects-reprise"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#broker-disconnects-reprise"}},[e._v("#")]),e._v(" Broker Disconnects (reprise)")]),e._v(" "),s("p",[e._v("The last released addressed various broker disconnect issues, and introduced some new ones. There were some strange behaviors with bus start, stop, restart, and timing related to the broker availability. There were also startup issues with Kafka.")]),e._v(" "),s("h2",{attrs:{id:"state-machine-request"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#state-machine-request"}},[e._v("#")]),e._v(" State Machine Request")]),e._v(" "),s("p",[e._v("The state machine requests have been updated, the RequestId property is now optional – if not specified, the "),s("code",[e._v("CorrelationId")]),e._v(" will be used as the RequestId.")]),e._v(" "),s("p",[e._v("The RequestId property is only cleared when the request completes. If the request times out or faults, the RequestId is retained to allow for message replay, etc.")]),e._v(" "),s("p",[e._v("The ServiceAddress is now optional, requests will be published if it is not specified (finally).")]),e._v(" "),s("blockquote",[s("p",[e._v("Also, a Timeout of "),s("code",[e._v("TimeSpan.Zero")]),e._v(" has always eliminated the need for a scheduler by not having a timeout.")])]),e._v(" "),s("h2",{attrs:{id:"request-client-silent-exceptions"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#request-client-silent-exceptions"}},[e._v("#")]),e._v(" Request Client (silent) Exceptions")]),e._v(" "),s("p",[e._v("A silent/caught exception in the request client has been eliminated by restructuring the "),s("code",[e._v("HandleFault")]),e._v(" logic.")]),e._v(" "),s("h2",{attrs:{id:"amazon-sqs"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#amazon-sqs"}},[e._v("#")]),e._v(" Amazon SQS")]),e._v(" "),s("p",[e._v("The Amazon packages were updated to the latest, along with a few create queue/topic fixes.")]),e._v(" "),s("h2",{attrs:{id:"event-hub"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#event-hub"}},[e._v("#")]),e._v(" Event Hub")]),e._v(" "),s("p",[e._v("A blob container permissions issue was addressed.")]),e._v(" "),s("h2",{attrs:{id:"uwp"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#uwp"}},[e._v("#")]),e._v(" UWP")]),e._v(" "),s("p",[e._v("The GetProcess exception is caught and ignored, so UWP applications should be able to use MassTransit now.")])])}),[],!1,null,null,null);t.default=r.exports}}]);