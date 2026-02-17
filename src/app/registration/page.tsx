'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  dob: string;
  phone: string;
  photo: File | null;
  aadharCard: File | null;
  isStudent: string;
  organisation: string;
  parentName: string;
  parentNumber: string;
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    dob: '',
    phone: '',
    photo: null,
    aadharCard: null,
    isStudent: '',
    organisation: '',
    parentName: '',
    parentNumber: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));

      if (name === 'photo') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(files[0]);
      }

      if (errors[name as keyof FormData]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.photo) newErrors.photo = 'Photo is required';
    if (!formData.aadharCard) newErrors.aadharCard = 'Aadhar card is required';
    
    if (!formData.isStudent) {
      newErrors.isStudent = 'Please select whether you are a student or not';
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = "Parent's name is required";
    }
    if (!formData.parentNumber.trim()) {
      newErrors.parentNumber = "Parent's number is required";
    } else if (!/^\d{10}$/.test(formData.parentNumber)) {
      newErrors.parentNumber = 'Parent number must be 10 digits';
    }

    if (!formData.organisation.trim()) {
      newErrors.organisation = 'Organisation name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for API submission
      const apiFormData = new FormData();
      
      // Append all fields
      apiFormData.append('name', formData.name);
      apiFormData.append('email', formData.email);
      apiFormData.append('dob', formData.dob);
      apiFormData.append('phone', formData.phone);
      apiFormData.append('isStudent', formData.isStudent);
      apiFormData.append('organisation', formData.organisation);
      apiFormData.append('parentName', formData.parentName);
      apiFormData.append('parentNumber', formData.parentNumber);
      
      // Append files
      if (formData.photo) {
        apiFormData.append('photo', formData.photo);
      }
      if (formData.aadharCard) {
        apiFormData.append('aadharCard', formData.aadharCard);
      }

      // Send POST request to API
      const response = await fetch('/api/registration', {
        method: 'POST',
        body: apiFormData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success modal
        setShowSuccessModal(true);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          dob: '',
          phone: '',
          photo: null,
          aadharCard: null,
          isStudent: '',
          organisation: '',
          parentName: '',
          parentNumber: '',
        });
        setPhotoPreview('');
      } else {
        // Show error message
        alert(result.message || 'Failed to submit registration. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Form</h1>
              <p className="text-gray-600">Please fill in all the required information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* DOB and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border ${errors.dob ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  />
                  {errors.dob && <p className="mt-1 text-sm text-red-500">{errors.dob}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                  Photo <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  )}
                  <label className={`flex-1 ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className={`w-full px-4 py-3 border-2 border-dashed ${errors.photo ? 'border-red-500' : 'border-gray-300'} rounded-lg hover:border-blue-500 transition text-center ${isSubmitting ? 'bg-gray-100' : ''}`}>
                      <span className="text-gray-600">
                        {formData.photo ? formData.photo.name : 'Click to upload photo'}
                      </span>
                    </div>
                    <input
                      type="file"
                      id="photo"
                      name="photo"
                      onChange={handleFileChange}
                      accept="image/*"
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </label>
                </div>
                {errors.photo && <p className="mt-1 text-sm text-red-500">{errors.photo}</p>}
              </div>

              {/* Aadhar Card Upload */}
              <div>
                <label htmlFor="aadharCard" className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Card <span className="text-red-500">*</span>
                </label>
                <label className={`${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'} block`}>
                  <div className={`w-full px-4 py-3 border-2 border-dashed ${errors.aadharCard ? 'border-red-500' : 'border-gray-300'} rounded-lg hover:border-blue-500 transition text-center ${isSubmitting ? 'bg-gray-100' : ''}`}>
                    <span className="text-gray-600">
                      {formData.aadharCard ? formData.aadharCard.name : 'Click to upload Aadhar card'}
                    </span>
                  </div>
                  <input
                    type="file"
                    id="aadharCard"
                    name="aadharCard"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    disabled={isSubmitting}
                    className="hidden"
                  />
                </label>
                {errors.aadharCard && <p className="mt-1 text-sm text-red-500">{errors.aadharCard}</p>}
              </div>

              {/* Are you a student - Radio Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Are you a student? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-6">
                  <label className={`flex items-center ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      name="isStudent"
                      value="yes"
                      checked={formData.isStudent === 'yes'}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Yes</span>
                  </label>
                  <label className={`flex items-center ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      name="isStudent"
                      value="no"
                      checked={formData.isStudent === 'no'}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">No</span>
                  </label>
                </div>
                {errors.isStudent && <p className="mt-1 text-sm text-red-500">{errors.isStudent}</p>}
              </div>

              {/* Parent Information */}
              <div className="space-y-6 bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h3>
                
                <div>
                  <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-2">
                    Parent's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border ${errors.parentName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    placeholder="Enter parent's name"
                  />
                  {errors.parentName && <p className="mt-1 text-sm text-red-500">{errors.parentName}</p>}
                </div>

                <div>
                  <label htmlFor="parentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Parent's Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="parentNumber"
                    name="parentNumber"
                    value={formData.parentNumber}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border ${errors.parentNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                  {errors.parentNumber && <p className="mt-1 text-sm text-red-500">{errors.parentNumber}</p>}
                </div>
              </div>

              {/* Organisation */}
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organisation Information</h3>
                
                <div>
                  <label htmlFor="organisation" className="block text-sm font-medium text-gray-700 mb-2">
                    Organisation Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="organisation"
                    name="organisation"
                    value={formData.organisation}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border ${errors.organisation ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    placeholder="Enter organisation/school/college name"
                  />
                  {errors.organisation && <p className="mt-1 text-sm text-red-500">{errors.organisation}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Registration Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                Your registration has been submitted successfully. We will contact you soon.
              </p>
              
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}