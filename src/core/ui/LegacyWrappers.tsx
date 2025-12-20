/**
 * Legacy library wrappers for backwards compatibility
 * Wraps external UI libraries to match our component interfaces
 */

import React, { useEffect } from 'react';
import type {
  NotificationComponent,
  ModalComponent,
  ConfettiComponent,
} from './interfaces';
import { LegacyLibraries } from './legacyDetector';
import { BuiltInNotification } from './BuiltInNotification';
import { BuiltInModal } from './BuiltInModal';
import { BuiltInConfetti } from './BuiltInConfetti';

/**
 * Wrapper for react-toastify toast notifications
 * Falls back to built-in notification if not available
 */
export const createLegacyToastNotification = (
  libraries: LegacyLibraries
): NotificationComponent => {
  return ({ achievement, onClose }) => {
    const { toast } = libraries;

    useEffect(() => {
      if (!toast) return;

      // Call toast.success with achievement content
      toast.success(
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '2em', marginRight: '10px' }}>
            {achievement.icon}
          </span>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
              Achievement Unlocked!
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {achievement.title}
            </div>
            {achievement.description && (
              <div style={{ fontSize: '13px', opacity: 0.9 }}>
                {achievement.description}
              </div>
            )}
          </div>
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: achievement.id,
          onClose,
        }
      );
    }, [achievement, toast, onClose]);

    return null; // Toast handles its own rendering
  };
};

/**
 * Wrapper for react-modal Modal component
 * Falls back to built-in modal if not available
 */
export const createLegacyModalWrapper = (
  libraries: LegacyLibraries
): ModalComponent => {
  return (props) => {
    const { Modal } = libraries;

    // If Modal not available, use built-in
    if (!Modal) {
      return <BuiltInModal {...props} />;
    }

    // Use react-modal
    return (
      <Modal
        isOpen={props.isOpen}
        onRequestClose={props.onClose}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          },
          content: {
            position: 'relative',
            background: '#fff',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: 'none',
            inset: 'auto',
          },
        }}
        contentLabel="Achievements"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0 }}>🏆 Achievements</h2>
          <button
            onClick={props.onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Achievement list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {props.achievements.map((achievement) => {
            const icon =
              (achievement.achievementIconKey &&
                props.icons?.[achievement.achievementIconKey]) ||
              '⭐';

            return (
              <div
                key={achievement.achievementId}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: achievement.isUnlocked
                    ? '#f0f9ff'
                    : '#f5f5f5',
                  borderRadius: '8px',
                  opacity: achievement.isUnlocked ? 1 : 0.6,
                }}
              >
                <div
                  style={{
                    fontSize: '32px',
                    filter: achievement.isUnlocked ? 'none' : 'grayscale(1)',
                  }}
                >
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                    {achievement.achievementTitle}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                    {achievement.achievementDescription}
                  </p>
                </div>
                {!achievement.isUnlocked && <div>🔒</div>}
              </div>
            );
          })}
        </div>
      </Modal>
    );
  };
};

/**
 * Wrapper for react-confetti Confetti component
 * Falls back to built-in confetti if not available
 */
export const createLegacyConfettiWrapper = (
  libraries: LegacyLibraries
): ConfettiComponent => {
  return ({ show, duration = 5000, particleCount = 200, colors }) => {
    const { Confetti, useWindowSize: legacyUseWindowSize } = libraries;

    // If Confetti not available, use built-in
    if (!Confetti) {
      return (
        <BuiltInConfetti
          show={show}
          duration={duration}
          particleCount={particleCount}
          colors={colors}
        />
      );
    }

    // Use react-confetti with react-use's useWindowSize if available
    // Otherwise fall back to default dimensions
    let width = 0;
    let height = 0;

    if (legacyUseWindowSize) {
      const size = legacyUseWindowSize();
      width = size.width;
      height = size.height;
    } else if (typeof window !== 'undefined') {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    if (!show) return null;

    return (
      <Confetti
        width={width}
        height={height}
        numberOfPieces={particleCount}
        recycle={false}
        colors={colors}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 10001,
          pointerEvents: 'none',
        }}
      />
    );
  };
};
