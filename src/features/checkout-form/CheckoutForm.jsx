import React from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import cardsIcons from "../../assets/cards.svg";
import {
  CardIcon,
  LockOpenIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "../../components/icons";
import { elementStyle } from "../../constants";
import PaymentButton from "./PaymentButton";
import Spinner from "../../components/Spinner";
import useCheckoutForm from "./useCheckoutForm";

const CheckoutForm = () => {
  const {
    email,
    setEmail,
    error,
    setError,
    success,
    setSuccess,
    isSubmitting,
    focusStatus,
    handleFieldChange,
    onFocus,
    onBlur,
    isFormValid,
    handleSubmit,
  } = useCheckoutForm();

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
                onChange={(event) =>
                  handleFieldChange("cardNumber", event.complete)
                }
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
                onChange={(event) =>
                  handleFieldChange("cardExpiry", event.complete)
                }
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
                onChange={(event) =>
                  handleFieldChange("cardCvc", event.complete)
                }
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
            className={`w-full py-4 font-semibold rounded-custom focus:outline-none focus:ring-2 flex items-center justify-center transition-all duration-100 ${
              isFormValid() && !isSubmitting
                ? "bg-green-600 focus:ring-green-500 hover:bg-green-700 text-white"
                : "bg-green-900 cursor-not-allowed text-gray-400"
            }`}
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? (
              <Spinner />
            ) : (
              <>
                {isFormValid() ? (
                  <LockOpenIcon className="w-3 h-3 mr-1" />
                ) : (
                  <LockClosedIcon className="w-3 h-3 mr-1" />
                )}
              </>
            )}
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
