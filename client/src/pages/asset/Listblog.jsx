import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BlogTableItem from '../../components/admin/BlogTableItem'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Listblog = () => {

  const [blogs, setBlogs] = useState([])
  const [searchParams] = useSearchParams()

  const { axios } = useAppContext()

  const status = searchParams.get('status')

  const fetchBlogs = async () => {
    try {

      const { data } = await axios.get('/api/admin/blogs')

      if (data.success) {

        let blogList = data.blogs || []

        // =========================
        // SHOW ONLY DRAFTS
        // =========================
        if (status === 'drafts') {
          blogList = blogList.filter(
            (blog) => blog.isPublished === false
          )
        }

        setBlogs(blogList)

      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.error('Fetch Blogs Error:', error)
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Unable to load blogs'
      )
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [status])

  return (

    <div className='flex-1 pt-5 px-5 sm:pt-12 sm:pl-16 bg-orange-50/10'>

      {/* ================= TITLE ================= */}

      <div className='flex items-center justify-between mb-4'>

        <div>

          <h1 className='text-xl font-medium text-gray-700'>
            {status === 'drafts' ? 'Draft Blogs' : 'All Blogs'}
          </h1>

          {status === 'drafts' && (
            <p className='text-sm text-gray-400 mt-1'>
              Blogs waiting for publication
            </p>
          )}

        </div>

        {status === 'drafts' && (
          <span className='bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm'>
            {blogs.length} Draft{blogs.length !== 1 ? 's' : ''}
          </span>
        )}

      </div>


      {/* ================= BLOG TABLE ================= */}

      <div className='relative h-4/5 mt-4 max-w-4xl overflow-x-auto shadow rounded-lg
                scrollbar-hide bg-blue-50/20'>

        <table className='w-full text-sm text-gray-500'>

          <thead className='text-xs text-gray-600 text-left uppercase'>

            <tr>

              <th
                scope='col'
                className='px-2 py-4 xl:px-6'
              >
                #
              </th>

              <th
                scope='col'
                className='px-2 py-4'
              >
                Blog Title
              </th>

              <th
                scope='col'
                className='px-2 py-4 max-sm:hidden'
              >
                Date
              </th>

              <th
                scope='col'
                className='px-2 py-4 max-sm:hidden'
              >
                Status
              </th>

              <th
                scope='col'
                className='px-2 py-4'
              >
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {blogs.length > 0 ? (

              blogs.map((blog, index) => {

                return (

                  <BlogTableItem
                    key={blog._id}
                    blog={blog}
                    fetchBlogs={fetchBlogs}
                    index={index + 1}
                  />

                )

              })

            ) : (

              <tr>

                <td
                  colSpan='5'
                  className='text-center py-10 text-gray-400'
                >

                  {status === 'drafts'
                    ? 'No draft blogs found'
                    : 'No blogs found'
                  }

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Listblog