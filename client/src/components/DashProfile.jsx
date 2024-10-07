import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { Alert, Button, Modal, TextInput } from 'flowbite-react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import { app } from './../firebase.js';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { updateStart,updateSuccess,updateFailure,deleteUserStart,deleteUserSuccess,deleteUserFailure ,signoutSuccess} from '../redux/User/userSlice.js';
import { useDispatch } from 'react-redux';
import {HiOutlineExclamationCircle} from "react-icons/hi"

export default function DashProfile() {
  const dispach=useDispatch();
  const { currentUser,error } = useSelector(state => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const filePickerRef=useRef();
  const [imageFileUploadingProgress,setImageFileUploadingProgress ]=useState(null);
  const [imageFileUploadError,setImageFileUploadError]=useState(null);
  const [imageFileUploading,setImageFileUploading]=useState(false);
  const [updateUserSuccess,setUpdateUserSuccess]= useState(null);
  const [updateUserError,setUpdateUserError]= useState(null);

  const [formData, setFormData]=useState({});
  const [showModel,setShowModel]=useState(false);
  
 

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
      setImageFileUploading(true);
    }
  }

  useEffect( ()=>{
    if(imageFile){
      uploadImage();
    }
  },[imageFile])

  const uploadImage=async ()=>{
    setImageFileUploadError(null);
    setImageFileUploading(true);    
    const storage=getStorage(app);
    const filename=new Date()+imageFile.name;
    const storageRef=ref(storage,filename);
    const uploadTask = uploadBytesResumable(storageRef,imageFile);
    uploadTask.on(
      'state_changed',
      (snapshot)=>{
        const progress= (snapshot.bytesTransferred/snapshot.totalBytes)*100;
        setImageFileUploadingProgress(progress.toFixed(0));
      },
      (error)=>{
        setImageFileUploadError('Could not upload image (File must be less than 2mb)');
        setImageFileUploadingProgress(null);
        setImageFileUrl(null);
        setImageFile(null);
        setImageFileUploading(false);
      },
      ()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl)=>{
          setImageFileUrl(downloadUrl);
          setFormData({...formData , profilePicture:downloadUrl});
          setImageFileUploading(false);
        });
      }
    )

  }
  const handleChange = (e)=>{
    setFormData({...formData , [e.target.id]:e.target.value});
  }

  const handleClick=()=>{
    setShowModel(true);
  }

  const handleDeleteUser=async()=>{
    setShowModel(false);
    try{
      dispach(deleteUserStart());
      const res=await fetch(`/api/user/delete/${currentUser._id}`,{
        method:'Delete',
      });
      const data=await res.json();
      if(!res.ok){
        dispach(deleteUserFailure(data.message));
      }
      else{
        dispach(deleteUserSuccess(data));
      }

    }catch(err){
      dispach(deleteUserFailure(err.message));
    }

  }

  const handleSubmit=async (e)=>{
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if(Object.keys(formData).length==0){
      setUpdateUserError("No changes made");
      return ;
    }
    if(imageFileUploading){
      setUpdateUserError("Please wait for image to upload");
      return ;  //image is uploading so return 
    }
    try{
      dispach(updateStart());
      const res=await fetch(`/api/user/update/${currentUser._id}`,{
        method:'PUT',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify(formData),
      });
      const data= await  res.json();
    
      if(!res.ok){
        dispach(updateFailure(data.message));
        setUpdateUserError(data.message);
      }
      else{
        dispach(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully");
      }
    }catch(err){
      dispach(updateFailure(err.message));
      setUpdateUserError(data.message);
    }

  }
  const handleSignOut=async ()=>{
    try{
      const res=await fetch(`/api/auth/signout`,{method:'POST'});
      const data=await res.json();
      if(!res.ok){
        console.log(data.message);
      }
      else{
        dispach(signoutSuccess());
      }
    }catch(err){
      console.log(err.message);
    }
  }
  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <h1 className='my-7 text-center font-semibold text-3xl'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type="file" accept='image/*' onChange={handleImageChange} ref={filePickerRef} hidden />
        <div className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full" onClick={()=>filePickerRef.current.click()}>
          
          {imageFileUploadingProgress && (
            <CircularProgressbar value={imageFileUploadingProgress || 0} maxValue={100} text={`${imageFileUploadingProgress}%`}   strokeWidth={5} 
              styles={{
                root:{
                  width:'100%',
                  height:'100%',
                  position:'absolute'
                },
                path:{
                  stroke: `rgba(62,152,199 ,${imageFileUploadingProgress /100})`
                }
              }}
            />
          )}
          <img src={imageFileUrl || currentUser.profilePicture} alt="user"
           className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
            imageFileUploadingProgress && imageFileUploadingProgress <100 && 'opacity-60'
           }`} />

        </div>
        {imageFileUploadError && (
          <Alert color='failure'>{imageFileUploadError}</Alert>
        )}
        
        <TextInput type='text' id='username' placeholder='username' defaultValue={currentUser.username} onChange={handleChange} />
        <TextInput type='email' id='email' placeholder='email' defaultValue={currentUser.email} onChange={handleChange}/>
        <TextInput type='password' id='password' placeholder='password' onChange={handleChange}/>
        <Button type='submit' gradientDuoTone={'purpleToBlue'}>Update</Button>
      </form>
      <div className='text-red-500 flex justify-between mt-5'>
        <span onClick={handleClick} className='cursor-pointer'>Delete Account</span>
        <span className='cursor-pointer' onClick={handleSignOut}>Sign-Out</span>
      </div>
      {updateUserSuccess && 
        <Alert color='success' className='mt-5'>{updateUserSuccess}</Alert>
      }
      {error && 
        <Alert color='failure' className='mt-5'>{error}</Alert>
      }
      {
        updateUserError && 
        <Alert color='failure' className='mt-5'>{updateUserError}</Alert>
      }
      <Modal show ={showModel} onClose={()=> setShowModel(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto'/>
            <h3 className='mb-5 text-lg text-gray-500 dark:text-grey-400'>Are you sure you want to delete your account?</h3>
            <div className="flex justify-center gap-4">
              <Button color='failure' onClick={handleDeleteUser}>Yes,I am sure</Button>
              <Button color='success' onClick={()=>setShowModel(false)}>No, Cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
