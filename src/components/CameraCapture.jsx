import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCw, CheckCircle, XCircle } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose, isOpen }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageDataUrl);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-4xl max-h-screen flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 flex items-center justify-between">
          <h3 className="text-white text-xl font-bold flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Take Photo
          </h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Camera View or Captured Image */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-center p-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-white text-lg mb-4">{error}</p>
              <button onClick={startCamera} className="btn-primary">
                Retry
              </button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          {capturedImage ? (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={retakePhoto}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center gap-2 transition"
              >
                <XCircle className="w-5 h-5" />
                Retake
              </button>
              <button
                onClick={confirmPhoto}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center gap-2 transition"
              >
                <CheckCircle className="w-5 h-5" />
                Use Photo
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={switchCamera}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
                title="Switch Camera"
              >
                <RotateCw className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-2xl hover:scale-110 transition-transform duration-200 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-red-500"></div>
              </button>

              <div className="w-12"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;