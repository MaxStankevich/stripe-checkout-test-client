import { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import axios from "axios";

const useCheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusStatus, setFocusStatus] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  });
  const [fieldComplete, setFieldComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
    email: false,
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

  const handleFieldChange = (elementType, isComplete) => {
    setFieldComplete((prev) => ({
      ...prev,
      [elementType]: isComplete,
    }));
  };

  const isFormValid = () => {
    return (
      fieldComplete.cardNumber &&
      fieldComplete.cardExpiry &&
      fieldComplete.cardCvc &&
      fieldComplete.email
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

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
        setIsSubmitting(false);
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
        setIsSubmitting(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error occurred:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setFieldComplete((prev) => ({
      ...prev,
      email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email),
    }));
  }, [email]);

  return {
    email,
    setEmail,
    error,
    setError,
    success,
    setSuccess,
    isSubmitting,
    focusStatus,
    fieldComplete,
    onFocus,
    onBlur,
    handleFieldChange,
    isFormValid,
    handleSubmit,
  };
};

export default useCheckoutForm;
