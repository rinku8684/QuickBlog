import React, { useState } from 'react'
import { blogCategories } from '../assets/assets'
import BlogCard from './BlogCard';
import { useAppContext } from '../context/AppContext';

const Bloglist = () => {

    const[menu, setMenu]=useState("All")
    const {blogs,input} = useAppContext()

    const filteredBlogs = ()=>{
        if(input ===''){
            return blogs
        }
        return blogs.filter((blog)=> blog.title.toLowerCase().includes(input.toLowerCase()) || blog.category.toLowerCase().includes(input.toLowerCase()))

    }



  return (
    <div>

        <div className='flex justify-center gap-4 sm:gap-8 my-10 relative'>
            {['All', ...blogCategories].map((item)=>(
                <div key={item} className='relative'>
                    <button onClick ={()=>setMenu(item)}
                     className={'cursor-pointer text-black-500 px-4 py-1 relative z-10 '}>
                        {item}
                        {menu === item &&(
                            <div 
                            className='absolute left-0 right-0 top-0 h-7 -z-0 bg-blue-500 rounded-full origin-left animate-pill-in'> </div>
                        )}
                    </button>
                </div> 
            ))}
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 mb-24 mx-8 sm:mx-16 xl:mx-40'>
                {filteredBlogs().filter((blog)=> menu === "All" ? true : blog.category === menu ).map ((blog)=> <BlogCard key={blog._id} blog={blog}/>) }
        </div>
    

    </div>
  )
}

export default Bloglist