import React, { useState, useEffect } from "react";
import {
  PaymentRequestButtonElement,
  useStripe,
} from "@stripe/react-stripe-js";
import axios from "axios";

const PaymentButton = ({ setError, setSuccess }) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Total",
          amount: 1,
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
          console.error("Error occurred during payment method:", error);
          setError(error.message);
        }
      });
    }
  }, [stripe]);

  if (!canMakePayment || !paymentRequest) {
    return null;
  }

  return (
    <>
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              height: "57px",
            },
          },
        }}
        className="w-full py-2 mb-4"
      />
      <div className="relative flex items-center mb-2">
        <div className="flex-grow border-t border-input-placeholder"></div>
        <span className="flex-shrink text-sm mx-2 text-input-placeholder">
          Or pay by card
        </span>
        <div className="flex-grow border-t border-input-placeholder"></div>
      </div>
    </>
  );
};

export default PaymentButton;
