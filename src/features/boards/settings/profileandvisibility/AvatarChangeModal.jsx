import React, { useState, useCallback, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import Cropper from "react-easy-crop";
import axiosClient from "../../../../api/apiClient";
import ReactDOM from "react-dom";

// ===== Animation =====
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`;

// ===== Overlay =====
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  z-index: 9999;
`;

// ===== Modal Box =====
const Modal = styled.div`
  background: #111827;
  border-radius: 12px;
  padding: 22px;
  width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  animation: ${fadeIn} 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// ===== Components =====
const Title = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
`;

const CropContainer = styled.div`
  position: relative;
  width: 100%;
  height: 280px;
  background: #0b0f19;
  border-radius: 8px;
  overflow: hidden;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
`;

const Button = styled.button`
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: #fff;
  font-weight: 600;
  background: ${(p) =>
    p.secondary
      ? "#374151"
      : "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)"};
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: #f87171;
  font-size: 13px;
  text-align: center;
  margin: 0;
`;

// ===== Component =====
export default function AvatarChangeModal({ onClose, onUpdated }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef();

  // ===== Trap focus for accessibility =====
  useEffect(() => {
    const first = dialogRef.current.querySelector("button, input");
    first?.focus();
    const trap = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", trap);
    return () => window.removeEventListener("keydown", trap);
  }, [onClose]);

  const onCropComplete = useCallback((_, croppedArea) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  async function getCroppedImage(src, crop) {
    const image = await createImage(src);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = Math.min(crop.width, crop.height);
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(image, crop.x, crop.y, size, size, 0, 0, size, size);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
  }

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.setAttribute("crossOrigin", "anonymous");
      img.src = url;
    });
  }

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    setError("");
    try {
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
      const fd = new FormData();
      fd.append("avatar", blob, "avatar.jpg");
      await axiosClient.patch("/auth/me/profile/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await axiosClient.get("/auth/me");
      window.dispatchEvent(new Event("auth:user-updated"));
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Không thể lưu avatar. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <ModalOverlay>
      <Modal ref={dialogRef} role="dialog" aria-modal="true" aria-label="Đổi ảnh đại diện">
        <Title>Đổi ảnh đại diện</Title>
        {!imageSrc ? (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            aria-label="Chọn ảnh đại diện mới"
          />
        ) : (
          <CropContainer>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </CropContainer>
        )}
        {error && <ErrorText>{error}</ErrorText>}
        <ButtonRow>
          <Button secondary onClick={onClose}>
            Hủy
          </Button>
          {imageSrc && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu avatar"}
            </Button>
          )}
        </ButtonRow>
      </Modal>
    </ModalOverlay>,
    document.body
  );
}
