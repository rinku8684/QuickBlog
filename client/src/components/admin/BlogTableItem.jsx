import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const BlogTableItem = ({blog, fetchBlogs, index}) => {

    const {title, createdAt} = blog;

    const BlogDate = new Date(createdAt)

    const {axios} = useAppContext();
    const navigate = useNavigate();

    const deleteBlog = async()=>{
      const confirm = window.confirm('Are you sure you want to delete this blog?')
      if(!confirm) return;
      try {
        const{data} = await axios.post('/api/blog/delete', {id: blog._id})
        if(data.success){
          toast.success(data.message)
          await fetchBlogs()
        }else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    const togglePublish = async()=>{
      try {
        const{data} = await axios.post('/api/blog/toggle-publish', {id: blog._id})
      if(data.success){
          toast.success(data.message)
          await fetchBlogs()
        }else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
      
    }

  return (
    <tr className='border-y border-gray-300'>
        <th className='px-2 py-4'>{ index }</th>
        <td className='px-2 py-4'>{title}</td>
        <td className='px-2 py-4 max-sm:hidden'>{BlogDate.toDateString()}</td>
        <td className='px-2 py-4 max-sm:hidden'>
            <p className={`${blog.isPublished ? "text-green-600" : "text-orange-700"}`}>{blog.isPublished ? 'Published' : 'Unpublished'}</p>
        </td>
        <td className='px-2 py-4 flex text-xs gap-3'>
            <button onClick={() => navigate(`/admin/editBlog/${blog._id}`)} className='border border-blue-200 bg-blue-50 text-blue-700 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition'>✏️ Edit</button>
            <button onClick={togglePublish} className='border px-2 py-1 rounded cursor-pointer hover:bg-gray-50'>{blog.isPublished ? 'Unpublish' : 'Publish'}</button>
            <button type='button' onClick={deleteBlog} className='border border-red-100 bg-red-50 px-2 py-1 rounded text-red-600 hover:bg-red-100 transition'>🗑️ Delete</button>
        </td>
        
    </tr>
  )
}

export default BlogTableItem
