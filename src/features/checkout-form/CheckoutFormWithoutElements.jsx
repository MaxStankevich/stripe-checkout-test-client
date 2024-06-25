import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import InputMask from "react-input-mask";
import axios from "axios";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCcDiscover,
  FaCcAmex,
  FaCcJcb,
  FaCcDinersClub,
  FaCcApplePay,
  FaLockOpen,
} from "react-icons/fa";

console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const [email, setEmail] = useState("test@example.com");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expDate, setExpDate] = useState("12/34");
  const [cvc, setCvc] = useState("424");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const stripe = await stripePromise;

    // Split expDate into month and year
    const [expMonth, expYear] = expDate.split("/");

    try {
      // Create a token
      const { token, error: tokenError } = await stripe.createToken("card", {
        number: cardNumber.replace(/\s/g, ""),
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc,
      });

      console.log("token", token);

      if (tokenError) {
        console.log(tokenError);
        setError(tokenError.message);
        return;
      }

      // Send token to backend to create a payment intent
      const response = await axios.post(
        "http://localhost:3001/payment/create-payment-intent",
        {
          token: token.id,
          amount: 66600, // amount in cents
          email: email,
        }
      );

      const { clientSecret } = response.data;

      // Confirm the payment
      const { paymentIntent, error: confirmError } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: token.card,
            billing_details: {
              email: email,
            },
          },
        });

      if (confirmError) {
        setError(confirmError.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        setSuccess(true);
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-4">
        <h2 className="text-2xl font-bold text-center text-white">
          Total $666.00
        </h2>

        <button className="w-full py-2 mb-4 text-white bg-black rounded-full flex items-center justify-center">
          <FaCcApplePay className="w-6 h-6 mr-2" /> Apple Pay
        </button>

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

        <form onSubmit={handleSubmit}>
          <InputMask
            mask="9999 9999 9999 9999"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="1234 1234 1234 1234"
            className="w-full px-4 py-2 mt-4 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex space-x-4">
            <InputMask
              mask="99/99"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              placeholder="MM/YY"
              className="w-full px-4 py-2 mt-4 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <InputMask
              mask="999"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="CVC"
              className="w-full px-4 py-2 mt-4 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default CheckoutForm;
