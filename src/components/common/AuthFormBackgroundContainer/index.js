import React from 'react'

const AuthFormBackgroundContainer = ({ children }) => {
  return (
    <div
      className='w-screen h-screen bg-cover bg-center flex items-center justify-center'
      style={{ backgroundImage: "url('/assets/images/bg_image.png')" }}
    >
      <div className='bg-white shadow-lg rounded-xl px-10 py-12 w-full max-w-md'>
        <div className='flex justify-center mb-6'>
          <img
            src='/assets/images/logo.png'
            alt='Logo'
            width={150}
            height={40}
          />
        </div>
        {children}
      </div>
    </div>
  )
}

export default AuthFormBackgroundContainer
