import Axios from "axios";
import { toast } from 'react-toastify';
const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "pklttrtw");

        try {
            const response = await Axios.post("https://api.cloudinary.com/v1_1/ddiqhegho/image/upload", formData);
            const imageUrl = response.data.secure_url; // Extract the URL from the response
            console.log(response.data);
            toast.success("Image uploaded successfully!");
            return imageUrl;
        } catch (error) {
            console.error("Error uploading image:", error.response?.data?.error?.message || error.message);
            toast.error("Error uploading image.");
            throw new Error("Image upload failed");
        }
    };

    export default uploadImage;