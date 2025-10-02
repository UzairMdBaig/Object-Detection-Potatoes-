import { useState,useRef } from 'react';
import Typewriter from 'typewriter-effect';
import Input from './Input';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState(null);
  const [result, setResult] = useState(null);
  const imageFileInputRef = useRef(null);
  const videoFileInputRef = useRef(null);

  const handleChange = (e) => {
    setSelectedFile(e?.target?.files[0]);
    setUploadType(e?.target?.files[0]?.type?.startsWith("image/") ? "image" : "video");
  };

  
  const handleUpload = async () => {
    let url;
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }
    if (uploadType == "image") url = '/api/predict_image';
    else url = '/api/predict_video';
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json()
      setSelectedFile(null)
      setResult(data)
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  const handleClear = () => {
    if (imageFileInputRef.current) {
      setSelectedFile(null);
      setResult(null)
      imageFileInputRef.current.value = "";
      videoFileInputRef.current.value = "";
    }
  }  


  return (
    <div className="flex justify-between items-center h-screen bg-[rgb(15,15,16)]">
      <div className="text-[rgb(209,197,173)] p-8 ml-40">
        <h1 className="text-5xl font-bold">Potato Detector</h1>
        <p className="text-xl mt-4 mb-28">Upload an image/video to detect potatoes.</p>
        <div className='flex gap-8'>
          <Input InputType='image' uploadType={uploadType} fileInputRef={imageFileInputRef} selectedFile={selectedFile} handleChange={handleChange} />
          <Input InputType='video' uploadType={uploadType} fileInputRef={videoFileInputRef} selectedFile={selectedFile} handleChange={handleChange} />
        </div>
      </div>
      <div className='flex flex-col mr-40'>
        <div className='w-full h-48 bg-[rgb(146,138,121)] rounded-xl font-bold text-lg border-dashed flex justify-center items-center'>
          {result ? ( result.type === "image" ? <img className='object-fill w-full h-full rounded-xl' src={`data:image/jpeg;base64,${result.data}`} alt="predicted image" /> : <video
                controls
                autoPlay
                className="rounded-xl w-full h-full"
                src={`data:video/webm;base64,${result.data}`}
              />) : <Typewriter
            options={{
              strings: ["Awaiting upload..."],
              autoStart: true,
              loop: true,
            }}
          />}
        </div>
        <div className="flex  justify-between mr-40 w-full">
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold mt-4 px-4 py-2 rounded" onClick={handleUpload}>Upload Content </button>
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold mt-4 px-6 py-2 rounded" onClick={handleClear}>Clear input</button>
        </div>
      </div>
    </div>
  );
}
