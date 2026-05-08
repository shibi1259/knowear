import React from 'react'

const Failed = () => {
  return (
    <div>
      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
          <div className="mx-auto max-w-screen-sm text-center">
            <h1 className="mb-4 text-4xl tracking-tight font-extrabold lg:text-4xl text-primary-600 dark:text-primary-500">Payment Failed</h1>
            <p className="mb-4 text-sm tracking-tight font-bold text-gray-900 md:text-lg dark:text-white">Something went wrong.</p>
            <a href="/" className="inline-flex text-black underline bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4">Back to Homepage</a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Failed
