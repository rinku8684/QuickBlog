import React from 'react'
import { useNavigate } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  if (!blog) return null;

  const { title, description, category, image, _id } = blog;
  const navigate = useNavigate();

  const shortDesc = description ? description.slice(0, 80) : '';

  return (
    <div
      onClick={() => navigate(`/blog/${_id}`)}
      className='w-full rounded-lg overflow-hidden shadow hover:scale-105 hover:shadow-blue/25 duration-300 cursor-pointer'
    >
      <img src={image} alt={title} className='aspect-video' />
      <span className='ml-5 mt-4 px-3 py-1 inline-block bg-blur rounded-full text-blue text-xs'>
        {category}
      </span>
      <div className='p-5'>
        <h5 className='mb-2 font-medium text-gray-900'>{title}</h5>
        <p
          className='mb-3 text-xs text-gray-600'
          dangerouslySetInnerHTML={{ __html: shortDesc }}
        ></p>
      </div>
    </div>
  );
};

export default BlogCard;
