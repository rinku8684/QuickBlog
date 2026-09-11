import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import Bloglist from '../components/Bloglist'
import BlogCard from '../components/BlogCard'
import Footer from '../components/Footer'
 

const Home = () => {
  return (
    <>
      <Navbar/>
      <Header/>
      <Bloglist/>
      <BlogCard/>
      <Footer/>
      
    </>
  )
}

export default Home
