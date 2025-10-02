export default function Input({ fileInputRef, selectedFile, InputType, uploadType, handleChange }) {
    let text;
    if ((InputType == "image" && !selectedFile) || (InputType== "image" && uploadType== "video")) {
        text = "Select Image"
    }
    else if ((InputType=="video" && !selectedFile) || (InputType== "video" && uploadType== "image")) {
        text = "Select Video"
    }
    else if (selectedFile){
        text = selectedFile.name
    }
    return (
        <div className="relative w-56 ">
            <button
        type="button"
        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 w-full inline-flex items-center justify-center rounded"
    >
        <svg
        fill="#FFF"
        height="18"
        viewBox="0 0 24 24"
        width="18"
        xmlns="http://www.w3.org/2000/svg"
        >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
        </svg>
        <span className="ml-2">{text}</span>
    </button>

    <input
        type="file"
        accept={InputType+"/*"}
        name={InputType+"Files"}
        multiple
        ref={fileInputRef}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {handleChange(e)}}
    />
    </div>
);
    }