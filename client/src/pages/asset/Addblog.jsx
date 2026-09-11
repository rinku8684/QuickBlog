import React, { useEffect, useRef, useState } from 'react'
import { assets, blogCategories } from '../../assets/assets'
import Quill from 'quill'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { parse } from 'marked'
import AIStudio from '../../components/admin/AIStudio'

const Addblog = () => {

  const { axios } = useAppContext()

  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const editorRef = useRef(null)
  const quillRef = useRef(null)

  const [image, setImage] = useState(false)
  const [title, setTitle] = useState('')
  const [subtitle, setSubTitle] = useState('')
  const [category, setCategory] = useState('Startup')
  const [isPublished, setIsPublished] = useState(false)

  // AI generated SEO data
  const [seoData, setSeoData] = useState(null)

  // =====================================================
  // SANITIZE ERROR MESSAGE
  // =====================================================

  const sanitizeMessage = (msg) => {

    if (!msg) {
      return 'An error occurred'
    }

    const s =
      typeof msg === 'string'
        ? msg
        : JSON.stringify(msg)

    if (s.trim().startsWith('{')) {

      try {

        const p = JSON.parse(s)

        if (p?.error?.message) {
          return p.error.message
        }

        if (p?.message) {
          return String(p.message)
        }

      } catch (_) {}

    }

    return s.length > 240
      ? s.slice(0, 240) + '…'
      : s
  }

  // =====================================================
  // GET CURRENT QUILL CONTENT
  // =====================================================

  const getCurrentContent = () => {

    if (!quillRef.current) {
      return ''
    }

    return quillRef.current.root.innerHTML || ''

  }

  // =====================================================
  // CHECK EMPTY QUILL CONTENT
  // =====================================================

  const isEditorEmpty = () => {

    if (!quillRef.current) {
      return true
    }

    const text =
      quillRef.current.getText()?.trim() || ''

    return text.length === 0
  }

  // =====================================================
  // SET QUILL CONTENT
  // =====================================================

  const setQuillContent = (html) => {

    if (!quillRef.current) {
      return
    }

    try {

      quillRef.current.setContents([])

      if (html) {

        quillRef.current.clipboard.dangerouslyPasteHTML(
          html
        )

      }

    } catch (error) {

      console.error(
        'Quill content update error:',
        error
      )

    }

  }

  // =====================================================
  // GENERATE BLOG WITH AI
  // =====================================================

  const generateContent = async () => {

    if (loading) {
      return
    }

    if (!title.trim()) {

      toast.error(
        'Please enter a title'
      )

      return
    }

    try {

      setLoading(true)

      const { data } =
        await axios.post(
          '/api/blog/generate',
          {
            prompt: title.trim()
          }
        )

      if (!data.success) {

        toast.error(
          sanitizeMessage(data.message),
          {
            id: 'gen-error'
          }
        )

        return
      }

      if (!data.content) {

        toast.error(
          'AI did not return any blog content',
          {
            id: 'gen-error'
          }
        )

        return
      }

      const htmlContent =
        parse(
          String(data.content)
        )

      setQuillContent(
        htmlContent
      )

      setAnalysis(null)

      toast.success(
        'Blog content generated successfully',
        {
          id: 'gen-success'
        }
      )

    } catch (error) {

      console.error(
        'Generate blog error:',
        error
      )

      toast.error(
        sanitizeMessage(
          error.response?.data?.message ||
          error.message ||
          error
        ),
        {
          id: 'gen-error'
        }
      )

    } finally {

      setLoading(false)

    }

  }

  // =====================================================
  // IMPROVE BLOG WITH AI
  // =====================================================

  const improveBlog = async () => {

    if (loading) {
      return
    }

    if (isEditorEmpty()) {

      toast.error(
        'Please write some blog content first'
      )

      return
    }

    try {

      setLoading(true)

      const currentContent =
        getCurrentContent()

      const { data } =
        await axios.post(
          '/api/blog/improve',
          {
            title: title.trim(),
            subTitle: subtitle.trim(),
            description: currentContent,
            category,
            suggestions:
              'Make the blog more professional, engaging and easy to read.'
          }
        )

      if (!data.success) {

        toast.error(
          sanitizeMessage(data.message),
          {
            id: 'improve-error'
          }
        )

        return
      }

      if (!data.content) {

        toast.error(
          'AI did not return improved content',
          {
            id: 'improve-error'
          }
        )

        return
      }

      const htmlContent =
        parse(
          String(data.content)
        )

      setQuillContent(
        htmlContent
      )

      setAnalysis(null)

      toast.success(
        'Blog improved successfully',
        {
          id: 'improve-success'
        }
      )

    } catch (error) {

      console.error(
        'Improve blog error:',
        error
      )

      toast.error(
        sanitizeMessage(
          error.response?.data?.message ||
          error.message ||
          error
        ),
        {
          id: 'improve-error'
        }
      )

    } finally {

      setLoading(false)

    }

  }

  // =====================================================
  // ANALYZE BLOG WITH AI
  // =====================================================

  const analyzeBlog = async () => {

    if (analyzing || loading) {
      return
    }

    if (!title.trim()) {

      return toast.error(
        'Please enter a blog title'
      )

    }

    if (isEditorEmpty()) {

      return toast.error(
        'Please generate or write some blog content first'
      )

    }

    try {

      setAnalyzing(true)
      setAnalysis(null)

      const blogContent =
        getCurrentContent()

      console.log(
        'Analyze Request:',
        {
          title,
          content: blogContent,
          category
        }
      )

      const { data } =
        await axios.post(
          '/api/blog/analyze',
          {
            title: title.trim(),
            content: blogContent,
            category: category || 'General'
          }
        )

      if (data.success) {

        setAnalysis(
          data.analysis
        )

        toast.success(
          'Blog analysis completed',
          {
            id: 'analysis-success'
          }
        )

      } else {

        toast.error(
          sanitizeMessage(
            data.message
          ),
          {
            id: 'analysis-error'
          }
        )

      }

    } catch (error) {

      console.error(
        'Analysis error:',
        error
      )

      toast.error(
        sanitizeMessage(
          error.response?.data?.message ||
          error.message ||
          error
        ),
        {
          id: 'analysis-error'
        }
      )

    } finally {

      setAnalyzing(false)

    }

  }

  // =====================================================
  // ADD BLOG
  // =====================================================

  const onSubmitHandler = async (
    e,
    publishStatus = isPublished
  ) => {

    e.preventDefault()

    if (isAdding) {
      return
    }

    // IMAGE
    if (!image) {

      toast.error(
        'Please upload a thumbnail'
      )

      return
    }

    // TITLE
    if (!title.trim()) {

      toast.error(
        'Please enter a blog title'
      )

      return
    }

    // CONTENT
    if (isEditorEmpty()) {

      toast.error(
        'Please write or generate blog content first'
      )

      return
    }

    // CATEGORY
    if (!category) {

      toast.error(
        'Please select a blog category'
      )

      return
    }

    try {

      setIsAdding(true)

      const blogContent =
        getCurrentContent()

      // =================================================
      // BLOG DATA
      // =================================================

      const blog = {

        title:
          title.trim(),

        subTitle:
          subtitle.trim(),

        description:
          blogContent,

        category,

        // IMPORTANT
        // false = Draft
        // true = Published
        isPublished:
          Boolean(publishStatus),

        // AI SEO DATA
        ...(seoData || {})

      }

      console.log(
        'Blog Submit Data:',
        blog
      )

      // =================================================
      // FORM DATA
      // =================================================

      const formData =
        new FormData()

      formData.append(
        'blog',
        JSON.stringify(blog)
      )

      formData.append(
        'image',
        image
      )

      // =================================================
      // API REQUEST
      // =================================================

      const { data } =
        await axios.post(
          '/api/blog/add',
          formData
        )

      if (!data.success) {

        toast.error(
          sanitizeMessage(
            data.message
          ),
          {
            id: 'add-error'
          }
        )

        return
      }

      // =================================================
      // SUCCESS MESSAGE
      // =================================================

      toast.success(
        publishStatus
          ? 'Blog published successfully'
          : 'Blog saved as draft successfully',
        {
          id: 'add-success'
        }
      )

      // =================================================
      // RESET FORM
      // =================================================

      setImage(false)

      setTitle('')

      setSubTitle('')

      setCategory('Startup')

      setIsPublished(false)

      setAnalysis(null)

      setSeoData(null)

      // CLEAR QUILL
      if (quillRef.current) {

        quillRef.current.setContents([])

      }

      // CLEAR FILE INPUT
      const fileInput =
        document.getElementById('image')

      if (fileInput) {
        fileInput.value = ''
      }

    } catch (error) {

      console.error(
        'Add blog error:',
        error
      )

      toast.error(
        sanitizeMessage(
          error.response?.data?.message ||
          error.message ||
          error
        ),
        {
          id: 'add-error'
        }
      )

    } finally {

      setIsAdding(false)

    }

  }

  // =====================================================
  // INITIALIZE QUILL
  // =====================================================

  useEffect(() => {

    if (
      !quillRef.current &&
      editorRef.current
    ) {

      quillRef.current =
        new Quill(
          editorRef.current,
          {
            theme: 'snow',

            placeholder:
              'Write your blog content here...',

            modules: {

              toolbar: [

                [
                  {
                    header: [
                      1,
                      2,
                      3,
                      false
                    ]
                  }
                ],

                [
                  'bold',
                  'italic',
                  'underline',
                  'strike'
                ],

                [
                  {
                    list: 'ordered'
                  },
                  {
                    list: 'bullet'
                  }
                ],

                [
                  'link',
                  'blockquote'
                ],

                [
                  {
                    align: []
                  }
                ],

                [
                  {
                    color: []
                  },
                  {
                    background: []
                  }
                ],

                [
                  'clean'
                ]

              ]

            }

          }
        )

    }

  }, [])

  // =====================================================
  // IMAGE PREVIEW
  // =====================================================

  const imagePreview =
    image
      ? URL.createObjectURL(image)
      : assets.upload_area

  // =====================================================
  // UI
  // =====================================================

  return (

    <form
      onSubmit={onSubmitHandler}
      className='flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll'
    >

      <div className='bg-white w-full max-w-4xl p-4 md:p-10 shadow rounded'>

        {/* =================================================
            IMAGE
        ================================================= */}

        <p>
          Upload Thumbnail
        </p>

        <label htmlFor='image'>

          <img
            src={imagePreview}
            alt='Blog thumbnail'
            className='mt-2 h-16 rounded cursor-pointer object-cover'
          />

          <input
            onChange={(e) => {

              const file =
                e.target.files?.[0]

              if (file) {
                setImage(file)
              }

            }}
            type='file'
            id='image'
            accept='image/*'
            hidden
            required={!image}
          />

        </label>

        {/* =================================================
            TITLE
        ================================================= */}

        <p className='mt-4'>
          Blog Title
        </p>

        <input
          type='text'
          placeholder='Type here'
          required
          className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded'
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
          value={title}
        />

        {/* =================================================
            SUBTITLE
        ================================================= */}

        <p className='mt-4'>
          Sub Title
        </p>

        <input
          type='text'
          placeholder='Type here'
          className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded'
          onChange={(e) =>
            setSubTitle(
              e.target.value
            )
          }
          value={subtitle}
        />

        {/* =================================================
            CATEGORY
        ================================================= */}

        <p className='mt-4'>
          Blog Category
        </p>

        <select
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
          name='category'
          value={category}
          className='mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded'
        >

          {/* ALL OPTION */}

          <option value='All'>
            All
          </option>

          {/* OTHER CATEGORIES */}

          {blogCategories.map(
            (item, index) => (

              <option
                key={index}
                value={item}
              >
                {item}
              </option>

            )
          )}

        </select>

        {/* =================================================
            BLOG DESCRIPTION
        ================================================= */}

        <p className='mt-4'>
          Blog Description
        </p>

        <div className='max-w-lg pb-16 pt-2 relative'>

          <div
            ref={editorRef}
            className='bg-white'
          ></div>

          {/* =================================================
              LOADING OVERLAY
          ================================================= */}

          {loading && (

            <div className='absolute inset-0 flex items-center justify-center bg-black/10 mt-2 z-10'>

              <div className='w-8 h-8 rounded-full border-2 border-gray-400 border-t-white animate-spin'></div>

            </div>

          )}

          {/* =================================================
              AI BUTTONS
          ================================================= */}

          <div className='flex flex-wrap gap-2 mt-3'>

            <button
              disabled={loading}
              type='button'
              onClick={generateContent}
              className='text-xs text-white bg-black/70 px-4 py-1.5 rounded hover:bg-black cursor-pointer disabled:opacity-60'
            >

              {loading
                ? 'Generating...'
                : 'Generate Blog with AI'}

            </button>

            <button
              disabled={loading}
              type='button'
              onClick={improveBlog}
              className='text-xs text-white bg-blue-600 px-4 py-1.5 rounded hover:bg-blue-700 cursor-pointer disabled:opacity-60'
            >

              {loading
                ? 'Improving...'
                : 'Improve Blog'}

            </button>

            <button
              disabled={
                analyzing ||
                loading
              }
              type='button'
              onClick={analyzeBlog}
              className='text-xs text-white bg-purple-600 px-4 py-1.5 rounded hover:bg-purple-700 cursor-pointer disabled:opacity-60'
            >

              {analyzing
                ? 'Analyzing...'
                : '✨ Analyze My Blog'}

            </button>

          </div>

          {/* =================================================
              AI ANALYSIS
          ================================================= */}

          {analysis && (

            <div className='mt-6 p-5 bg-gray-50 border border-gray-200 rounded-lg'>

              {/* HEADER */}

              <div className='flex items-center justify-between mb-5'>

                <div>

                  <h2 className='text-lg font-semibold text-gray-800'>
                    🤖 AI Blog Coach
                  </h2>

                  <p className='text-xs text-gray-500 mt-1'>
                    AI-powered content analysis
                  </p>

                </div>

                <button
                  type='button'
                  onClick={() =>
                    setAnalysis(null)
                  }
                  className='text-gray-500 hover:text-black'
                >
                  ✕
                </button>

              </div>

              {/* OVERALL SCORE */}

              <div className='bg-white border rounded-lg p-4 mb-5'>

                <p className='text-sm text-gray-500'>
                  Overall Score
                </p>

                <p className='text-3xl font-bold text-gray-800'>

                  {analysis.overallScore ??
                    analysis.qualityScore ??
                    0}

                  /100

                </p>

              </div>

              {/* SEO */}

              <div className='space-y-3'>

                <div>

                  <div className='flex justify-between text-xs mb-1'>

                    <span>
                      SEO
                    </span>

                    <span>
                      {analysis.seoScore ?? 0}/100
                    </span>

                  </div>

                  <div className='w-full h-2 bg-gray-200 rounded'>

                    <div
                      className='h-2 bg-blue-500 rounded'
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            Number(
                              analysis.seoScore || 0
                            )
                          )
                        )}%`
                      }}
                    ></div>

                  </div>

                </div>

                {/* READABILITY */}

                <div>

                  <div className='flex justify-between text-xs mb-1'>

                    <span>
                      Readability
                    </span>

                    <span>
                      {analysis.readabilityScore ?? 0}/100
                    </span>

                  </div>

                  <div className='w-full h-2 bg-gray-200 rounded'>

                    <div
                      className='h-2 bg-green-500 rounded'
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            Number(
                              analysis.readabilityScore || 0
                            )
                          )
                        )}%`
                      }}
                    ></div>

                  </div>

                </div>

                {/* STRUCTURE */}

                <div>

                  <div className='flex justify-between text-xs mb-1'>

                    <span>
                      Structure
                    </span>

                    <span>
                      {analysis.structureScore ?? 0}/100
                    </span>

                  </div>

                  <div className='w-full h-2 bg-gray-200 rounded'>

                    <div
                      className='h-2 bg-purple-500 rounded'
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            Number(
                              analysis.structureScore || 0
                            )
                          )
                        )}%`
                      }}
                    ></div>

                  </div>

                </div>

                {/* ENGAGEMENT */}

                <div>

                  <div className='flex justify-between text-xs mb-1'>

                    <span>
                      Engagement
                    </span>

                    <span>
                      {analysis.engagementScore ?? 0}/100
                    </span>

                  </div>

                  <div className='w-full h-2 bg-gray-200 rounded'>

                    <div
                      className='h-2 bg-orange-500 rounded'
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            Number(
                              analysis.engagementScore || 0
                            )
                          )
                        )}%`
                      }}
                    ></div>

                  </div>

                </div>

              </div>

              {/* SUMMARY */}

              {analysis.summary && (

                <div className='mt-5'>

                  <h3 className='font-semibold text-sm'>
                    📝 Summary
                  </h3>

                  <p className='text-xs text-gray-600 mt-2'>
                    {analysis.summary}
                  </p>

                </div>

              )}

              {/* STRENGTHS */}

              {analysis.strengths?.length > 0 && (

                <div className='mt-5'>

                  <h3 className='font-semibold text-sm text-green-700 mb-2'>
                    ✓ Strengths
                  </h3>

                  <ul className='space-y-1'>

                    {analysis.strengths.map(
                      (item, index) => (

                        <li
                          key={index}
                          className='text-xs text-gray-600'
                        >
                          ✓ {item}
                        </li>

                      )
                    )}

                  </ul>

                </div>

              )}

              {/* WEAKNESSES */}

              {analysis.weaknesses?.length > 0 && (

                <div className='mt-5'>

                  <h3 className='font-semibold text-sm text-orange-700 mb-2'>
                    ⚠ Areas to Improve
                  </h3>

                  <ul className='space-y-1'>

                    {analysis.weaknesses.map(
                      (item, index) => (

                        <li
                          key={index}
                          className='text-xs text-gray-600'
                        >
                          ⚠ {item}
                        </li>

                      )
                    )}

                  </ul>

                </div>

              )}

              {/* SUGGESTIONS */}

              {analysis.suggestions?.length > 0 && (

                <div className='mt-5'>

                  <h3 className='font-semibold text-sm text-indigo-700 mb-2'>
                    💡 AI Suggestions
                  </h3>

                  <ul className='space-y-2'>

                    {analysis.suggestions.map(
                      (item, index) => (

                        <li
                          key={index}
                          className='text-xs text-gray-700 bg-white border border-gray-200 rounded p-2'
                        >
                          {index + 1}. {item}
                        </li>

                      )
                    )}

                  </ul>

                </div>

              )}

              {/* KEYWORDS */}

              {analysis.keywords?.length > 0 && (

                <div className='mt-5'>

                  <h3 className='font-semibold text-sm text-gray-700'>
                    🔑 Suggested Keywords
                  </h3>

                  <div className='flex flex-wrap gap-2 mt-2'>

                    {analysis.keywords.map(
                      (keyword, index) => (

                        <span
                          key={index}
                          className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full'
                        >
                          {keyword}
                        </span>

                      )
                    )}

                  </div>

                </div>

              )}

              {/* BETTER TITLE */}

              {analysis.betterTitle && (

                <div className='mt-5 p-3 bg-blue-50 rounded-lg'>

                  <h3 className='font-semibold text-sm'>
                    🎯 Suggested Better Title
                  </h3>

                  <p className='text-sm mt-1'>
                    {analysis.betterTitle}
                  </p>

                </div>

              )}

            </div>

          )}

        </div>

        {/* =================================================
            AI CONTENT STUDIO
        ================================================= */}

        <AIStudio
          title={title}
          subtitle={subtitle}
          category={category}
          getContent={() =>
            quillRef.current?.root?.innerHTML || ''
          }
          onSEOGenerated={setSeoData}
          onContentChanged={(newContent) => {

            if (
              quillRef.current &&
              newContent
            ) {

              setQuillContent(
                newContent
              )

            }

          }}
        />

        {/* =================================================
            SAVE / PUBLISH
        ================================================= */}

        <div className='flex flex-wrap gap-3 mt-8'>

          {/* =================================================
              SAVE AS DRAFT
          ================================================= */}

          <button
            disabled={isAdding}
            type='button'
            onClick={(e) => {

              setIsPublished(false)

              onSubmitHandler(
                e,
                false
              )

            }}
            className='w-40 h-10 bg-gray-600 text-white rounded cursor-pointer text-sm hover:bg-gray-700 disabled:opacity-60'
          >

            {isAdding
              ? 'Saving...'
              : '📝 Save as Draft'}

          </button>

          {/* =================================================
              PUBLISH BLOG
          ================================================= */}

          <button
            disabled={isAdding}
            type='button'
            onClick={(e) => {

              setIsPublished(true)

              onSubmitHandler(
                e,
                true
              )

            }}
            className='w-40 h-10 bg-[#F25022] text-white rounded cursor-pointer text-sm hover:bg-red-600 disabled:opacity-60'
          >

            {isAdding
              ? 'Publishing...'
              : '🚀 Publish Blog'}

          </button>

        </div>

      </div>

    </form>

  )

}

export default Addblog