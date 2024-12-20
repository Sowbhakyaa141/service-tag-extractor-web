import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import Webcam from 'react-webcam';
import { Camera, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from './components/ui/alert';


const ServiceTagExtractor = () => {
  const [mode, setMode] = useState('upload'); // 'upload' or 'camera'
  const [image, setImage] = useState(null);
  const [serviceTag, setServiceTag] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const webcamRef = useRef(null);
  
  const extractServiceTag = async (imageData) => {
    try {
      setIsProcessing(true);
      setError('');
      
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();
      
      // Service tag regex pattern (matches alphanumeric strings like D8JP9W2)
      const serviceTagPattern = /\b[A-Z0-9]{7}\b/g;
      const matches = text.match(serviceTagPattern);
      
      if (matches && matches.length > 0) {
        setServiceTag(matches[0]);
      } else {
        setError('No valid service tag found in the image');
      }
    } catch (err) {
      setError('Error processing image: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        extractServiceTag(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    extractServiceTag(imageSrc);
  };

  const resetImage = () => {
    setImage(null);
    setServiceTag('');
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-8">Service Tag Extractor</h1>
      
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            mode === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          <Upload size={20} />
          Upload Image
        </button>
        <button
          onClick={() => setMode('camera')}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            mode === 'camera' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          <Camera size={20} />
          Use Camera
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {mode === 'upload' && !image && (
          <div className="text-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <Upload size={48} className="text-gray-400" />
                <span>Click to upload an image</span>
              </div>
            </label>
          </div>
        )}

        {mode === 'camera' && !image && (
          <div className="relative">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded"
            />
            <button
              onClick={captureImage}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full"
            >
              <Camera size={24} />
            </button>
          </div>
        )}

        {image && (
          <div className="relative">
            <img src={image} alt="Captured" className="w-full rounded" />
            <button
              onClick={resetImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Processing image...</p>
        </div>
      )}

      {serviceTag && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription>
            Service Tag: <span className="font-mono font-bold">{serviceTag}</span>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ServiceTagExtractor;