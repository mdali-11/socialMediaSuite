import React, { useState, useEffect } from "react";
import { load } from "@cashfreepayments/cashfree-js";

const PaymentGateway = ({ cartId ="1234", amount ="1.00", userId="123" }) => {

  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cashfree, setCashfree] = useState(null);

  // 1. Pre-load the SDK for faster performance
  useEffect(() => {
    const initSDK = async () => {
      try {
        const instance = await load({ mode: "sandbox" }); // Change to "production" later
        setCashfree(instance);
      } catch (err) {
        console.error("SDK Load failed:", err);
        setError("Failed to load payment secure module.");
      }
    };
    initSDK();
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 2. Request Session from your Node.js Backend
      const response = await fetch("http://localhost:5000/api/payment/initiate-test-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, userId }),
      });

      const data = await response.json();

      if (!response.ok || !data.payment_session_id) {
        throw new Error(data.error || "Failed to initialize transaction.");
      }

      // 3. Trigger the Cashfree Checkout
      const checkoutOptions = {
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal", // Best UX: User stays on your site
      };

      const result = await cashfree.checkout(checkoutOptions);

      // 4. Handle SDK-level outcomes
      if (result.error) {
        // This handles cases like user closing the modal or bank failure
        console.log("Payment Error/Cancel:", result.error);
        setError(result.error.message);
      }

      if (result.redirect) {
        // This is triggered after a successful transaction
        console.log("Payment complete, redirecting for verification...");
      }

    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {error && <div style={styles.errorBanner}>{error}</div>}
      
      <button
        onClick={handlePayment}
        disabled={loading || !cashfree}
        style={{ ...styles.payBtn, opacity: loading || !cashfree ? 0.7 : 1 }}
      >
        {loading ? (
          <span>Securely Redirecting...</span>
        ) : (
          `Pay ₹${amount} Securely`
        )}
      </button>

      <p style={styles.footerText}>
        🔒 Encrypted by Cashfree Payments
      </p>
    </div>
  );
};

// Professional Minimal Styling
const styles = {
  container: { padding: "1rem", textAlign: "center" },
  payBtn: {
    backgroundColor: "#1a73e8",
    color: "white",
    padding: "12px 30px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  errorBanner: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "15px",
    fontSize: "14px",
  },
  footerText: { color: "#666", fontSize: "12px", marginTop: "10px" }
};

export default PaymentGateway;