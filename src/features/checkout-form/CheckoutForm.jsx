import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCcDiscover,
  FaCcAmex,
  FaCcJcb,
  FaCcDinersClub,
  FaLockOpen,
} from "react-icons/fa";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("test@example.com");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Total",
          amount: 66600,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
          setCanMakePayment(true);
        }
      });

      pr.on("paymentmethod", async (ev) => {
        try {
          const { clientSecret } = await axios
            .post(
              `${import.meta.env.VITE_API_URL}/payment/create-payment-intent`,
              {
                amount: 66600,
                email: ev.payerEmail,
              }
            )
            .then((res) => res.data);

          const { error: confirmError } = await stripe.confirmCardPayment(
            clientSecret,
            {
              payment_method: ev.paymentMethod.id,
            }
          );

          if (confirmError) {
            ev.complete("fail");
            setError(confirmError.message);
          } else {
            ev.complete("success");
            setSuccess(true);
          }
        } catch (error) {
          ev.complete("fail");
          setError(error.message);
        }
      });
    }
  }, [stripe]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          email: email,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/payment/create-payment-intent`,
        {
          paymentMethodId: paymentMethod.id,
          amount: 66600,
          email: email,
        }
      );

      const { clientSecret } = response.data;
      const { paymentIntent, error: confirmError } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        });

      if (confirmError) {
        setError(confirmError.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        setSuccess(true);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-4 rounded-lg">
        <h2 className="text-2xl font-bold text-center text-white">
          Total $666.00
        </h2>

        {canMakePayment && paymentRequest && (
          <PaymentRequestButtonElement
            options={{ paymentRequest }}
            className="w-full py-2 mb-4"
          />
        )}

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="flex-shrink mx-4 text-gray-400">Or pay by card</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>

        <div className="flex justify-between space-x-2">
          <FaCcVisa className="text-white w-10 h-10" />
          <FaCcMastercard className="text-white w-10 h-10" />
          <FaCcDiscover className="text-white w-10 h-10" />
          <FaCcAmex className="text-white w-10 h-10" />
          <FaCcJcb className="text-white w-10 h-10" />
          <FaCcDinersClub className="text-white w-10 h-10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-full px-4 py-2 mt-4 text-white bg-gray-700 rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    color: "#ffffff",
                    fontFamily: "Arial, sans-serif",
                    fontSmoothing: "antialiased",
                    fontSize: "16px",
                    "::placeholder": {
                      color: "#888888",
                    },
                  },
                  invalid: {
                    color: "#fa755a",
                    iconColor: "#fa755a",
                  },
                },
              }}
            />
          </div>

          <input
            type="email"
            placeholder="mail@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mt-4 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full py-2 mt-6 text-white bg-green-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
          >
            <FaLockOpen className="w-3 h-3 mr-2" /> Confirm Purchase
          </button>
        </form>

        {error && <div className="text-red-500 mt-4">{error}</div>}
        {success && (
          <div className="text-green-500 mt-4">Payment Successful!</div>
        )}
      </div>
    </div>
  );
};

const App = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default App;
