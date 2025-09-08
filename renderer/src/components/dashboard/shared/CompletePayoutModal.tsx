import React, { useState } from "react";

interface CompletePayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  payoutId: string;
  ticketId: string;
  amount: number;
  currency: string;
  isCompleting: boolean;
}

export const CompletePayoutModal: React.FC<CompletePayoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  payoutId,
  ticketId,
  amount,
  currency,
  isCompleting,
}) => {
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes);
  };

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Complete Payout</h3>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={isCompleting}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="payout-details">
            <div className="detail-row">
              <span className="detail-label">Payout ID:</span>
              <span className="detail-value">
                {payoutId.substring(0, 8)}...
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ticket ID:</span>
              <span className="detail-value">{ticketId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Amount:</span>
              <span className="detail-value">
                {currency} {amount.toFixed(2)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="notes">Completion Notes (Optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any notes about this payout completion..."
                rows={3}
                disabled={isCompleting}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isCompleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Completing...
                  </>
                ) : (
                  "Complete Payout"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
