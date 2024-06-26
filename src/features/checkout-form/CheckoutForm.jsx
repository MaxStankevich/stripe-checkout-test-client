import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import cardsIcons from "../../assets/cards.svg";
import { CardIcon, LockOpenIcon, EnvelopeIcon } from "../../components/icons";
import { elementStyle } from "../../constants";
import PaymentButton from "./PaymentButton";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [focusStatus, setFocusStatus] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  });

  const onFocus = (e) => {
    setFocusStatus((prev) => ({
      ...prev,
      [e.elementType]: true,
    }));
  };

  const onBlur = (e) => {
    setFocusStatus((prev) => ({
      ...prev,
      [e.elementType]: false,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!stripe || !elements) {
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);

    try {
      const { error: methodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardNumberElement,
          billing_details: {
            email: email,
          },
        });

      if (methodError) {
        setError(methodError.message);
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/payment/create-payment-intent`,
        {
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
      console.error("Error occurred:", error);
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full p-4">
        <p className="text-center text-white text-lg mb-4">Total $1.00</p>

        <PaymentButton setError={setError} setSuccess={setSuccess} />

        <div className="flex justify-between space-x-2 mb-4 px-2">
          <img src={cardsIcons} alt="Cards" />
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className={`flex items-center w-full px-4 py-4 max-h-input mb-3 text-white bg-input-custom rounded-custom border-2 ${
              focusStatus["cardNumber"]
                ? "border-green-600"
                : "border-input-custom"
            } transition-colors duration-100`}
          >
            <CardIcon />
            <div className="ml-2 flex-grow">
              <CardNumberElement
                options={{
                  style: elementStyle,
                }}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>
          <div className="flex justify-between mt-0 mb-3">
            <div
              className={`w-full px-2 py-4 max-h-input mr-4 text-white bg-input-custom rounded-custom border-2 ${
                focusStatus["cardExpiry"]
                  ? "border-green-600"
                  : "border-input-custom"
              } transition-colors duration-100`}
            >
              <CardExpiryElement
                options={{
                  style: {
                    ...elementStyle,
                    base: {
                      ...elementStyle.base,
                      textAlign: "center",
                    },
                  },
                }}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div
              className={`w-full px-2 py-4 max-h-input max-w-80 text-white bg-input-custom rounded-custom border-2 ${
                focusStatus["cardCvc"]
                  ? "border-green-600"
                  : "border-input-custom"
              } transition-colors duration-100`}
            >
              <CardCvcElement
                options={{
                  style: {
                    ...elementStyle,
                    base: {
                      ...elementStyle.base,
                      textAlign: "center",
                    },
                  },
                }}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>

          <div className="flex items-center w-full px-4 py-4 mb-3 text-white bg-input-custom rounded-custom border-2 border-input-custom focus-within:ring-2 focus-within:ring-green-600 transition-all duration-100">
            <EnvelopeIcon />
            <input
              type="email"
              placeholder="mail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow ml-2 text-white bg-input-custom placeholder-input-placeholder focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 text-white font-semibold bg-green-600 rounded-custom focus:outline-none focus:ring-2 focus:ring-green-500 hover:bg-green-700 flex items-center justify-center"
          >
            <LockOpenIcon className="w-3 h-3 mr-1" />
            Confirm Purchase
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

export default CheckoutForm;
