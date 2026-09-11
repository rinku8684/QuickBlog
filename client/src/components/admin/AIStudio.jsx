import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/AppContext'
import { parse } from 'marked'

const AIStudio = ({
  title,
  subtitle,
  category,
  authToken,
  getContent,
  onSEOGenerated,
  onContentChanged,
}) => {

  const { axios } = useAppContext()

  const [busy, setBusy] = useState('')
  const [seo, setSeo] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [quickResult, setQuickResult] = useState('')
  const [counter, setCounter] = useState(null)

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const [ideaTopic, setIdeaTopic] = useState('')
  const [blogIdeas, setBlogIdeas] = useState([])

  // =====================================================
  // AUTH CONFIG
  // =====================================================

  const requestConfig = authToken
    ? {
        headers: {
          Authorization: authToken
        }
      }
    : {}

  // =====================================================
  // GET CURRENT BLOG CONTENT
  // =====================================================

  const content = () => {

    const currentContent =
      getContent?.() || ""

    if (!currentContent) {
      return ""
    }

    return String(currentContent).trim()
  }

  // =====================================================
  // COMMON AI REQUEST HANDLER
  // =====================================================

  const run = async (
    key,
    request,
    success
  ) => {

    try {

      setBusy(key)

      const { data } =
        await request()

      if (!data.success) {

        toast.error(
          data.message ||
          'AI request failed'
        )

        return
      }

      success(data)

    } catch (error) {

      console.error(
        'AI Studio Error:',
        error
      )

      toast.error(
        error.response?.data?.message ||
        error.message ||
        'AI request failed'
      )

    } finally {

      setBusy('')

    }

  }

  // =====================================================
  // CONVERT AI CONTENT TO EDITOR HTML
  // =====================================================

  const convertToEditorHTML = (
    aiContent
  ) => {

    if (!aiContent) {
      return ''
    }

    let cleanContent =
      String(aiContent).trim()

    // Remove markdown code fences

    cleanContent =
      cleanContent
        .replace(
          /^```html\s*/i,
          ''
        )
        .replace(
          /^```markdown\s*/i,
          ''
        )
        .replace(
          /^```\s*/i,
          ''
        )
        .replace(
          /\s*```$/i,
          ''
        )
        .trim()

    try {

      return parse(
        cleanContent
      )

    } catch (error) {

      console.error(
        'Content conversion error:',
        error
      )

      return cleanContent
        .replace(
          /\n/g,
          '<br>'
        )

    }

  }

  // =====================================================
  // UPDATE MAIN QUILL EDITOR
  // =====================================================

  const updateEditorContent = (
    newContent
  ) => {

    if (!newContent) {
      return
    }

    const htmlContent =
      convertToEditorHTML(
        newContent
      )

    if (
      onContentChanged &&
      typeof onContentChanged === 'function'
    ) {

      onContentChanged(
        htmlContent
      )

    }

  }

  // =====================================================
  // GENERATE SEO
  // =====================================================

  const generateSEO = () => {

    if (
      !title?.trim() ||
      !content().trim()
    ) {

      return toast.error(
        'Add title and blog content first'
      )

    }

    run(
      'seo',

      () =>
        axios.post(
          '/api/blog/generate-seo',
          {
            title,
            subTitle: subtitle,
            description: content(),
            category
          },
          requestConfig
        ),

      (data) => {

        setSeo(
          data.seo
        )

        onSEOGenerated?.(
          data.seo
        )

        toast.success(
          'SEO data generated'
        )

      }
    )

  }

  // =====================================================
  // THUMBNAIL IDEA
  // =====================================================

  const thumbnailIdea = () => {

    if (!title?.trim()) {

      return toast.error(
        'Enter a blog title first'
      )

    }

    run(
      'thumbnail',

      () =>
        axios.post(
          '/api/blog/thumbnail-idea',
          {
            title,
            category
          },
          requestConfig
        ),

      (data) => {

        setThumbnail(
          data.idea
        )

        toast.success(
          'Thumbnail concept ready'
        )

      }
    )

  }

  // =====================================================
  // QUICK AI ACTIONS
  // =====================================================

  const quickAction = (
    action
  ) => {

    if (!content().trim()) {

      return toast.error(
        'Write or generate blog content first'
      )

    }

    run(
      action,

      () =>
        axios.post(
          '/api/blog/quick-action',
          {
            action,
            title,
            description: content(),
            category
          },
          requestConfig
        ),

      (data) => {

        setQuickResult(
          data.content || ''
        )

      }
    )

  }

  // =====================================================
  // COUNTER PERSPECTIVE
  // =====================================================

  const counterPerspective = () => {

    if (!content().trim()) {

      return toast.error(
        'Write or generate blog content first'
      )

    }

    run(
      'counter',

      () =>
        axios.post(
          '/api/blog/counter-perspective',
          {
            title,
            description: content(),
            category
          },
          requestConfig
        ),

      (data) => {

        setCounter(
          data.perspective
        )

      }
    )

  }

  // =====================================================
  // ASK AI
  // =====================================================

  const ask = () => {

    if (!question.trim()) {

      return toast.error(
        'Type a question first'
      )

    }

    if (!content().trim()) {

      return toast.error(
        'Write or generate blog content first'
      )

    }

    run(
      'ask',

      () =>
        axios.post(
          '/api/blog/ask',
          {
            question,
            title,
            description: content(),
            category
          },
          requestConfig
        ),

      (data) => {

        setAnswer(
          data.answer || ''
        )

      }
    )

  }

  // =====================================================
  // CHANGE BLOG TONE
  // =====================================================

  const changeTone = (
    tone
  ) => {

    if (!content().trim()) {

      return toast.error(
        'Write or generate blog content first'
      )

    }

    run(
      `tone-${tone}`,

      () =>
        axios.post(
          '/api/blog/change-tone',
          {
            title,
            description: content(),
            category,
            tone
          },
          requestConfig
        ),

      (data) => {

        if (!data.content) {

          toast.error(
            'AI did not return updated content'
          )

          return

        }

        updateEditorContent(
          data.content
        )

        toast.success(
          `${tone.charAt(0).toUpperCase() + tone.slice(1)} tone applied to your blog`
        )

      }
    )

  }

  // =====================================================
  // GENERATE BLOG IDEAS
  // =====================================================

  const generateIdeas = () => {

    if (
      !ideaTopic.trim() &&
      !category?.trim()
    ) {

      return toast.error(
        'Enter a topic or select a category first'
      )

    }

    run(
      'ideas',

      () =>
        axios.post(
          '/api/blog/generate-ideas',
          {
            topic: ideaTopic,
            category,
            count: 5
          },
          requestConfig
        ),

      (data) => {

        setBlogIdeas(
          Array.isArray(data.ideas)
            ? data.ideas
            : []
        )

        toast.success(
          'Blog ideas generated'
        )

      }
    )

  }

  // =====================================================
  // COPY TEXT
  // =====================================================

  const copyText = async (
    text,
    message
  ) => {

    try {

      await navigator.clipboard.writeText(
        text || ''
      )

      toast.success(
        message ||
        'Copied to clipboard'
      )

    } catch (error) {

      console.error(
        error
      )

      toast.error(
        'Unable to copy'
      )

    }

  }

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className='mt-5 border border-indigo-100 rounded-xl bg-indigo-50/40 p-4'>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className='flex items-center justify-between gap-3 mb-3'>

        <div>

          <h2 className='font-bold text-gray-800'>
            ✨ AI Content Studio
          </h2>

          <p className='text-xs text-gray-500'>
            Extra tools to make your blog smarter and more professional.
          </p>

        </div>

        <span className='text-[10px] bg-white border px-2 py-1 rounded-full text-indigo-600'>
          Gemini AI
        </span>

      </div>

      {/* =====================================================
          AI BUTTONS
      ===================================================== */}

      <div className='flex flex-wrap gap-2'>

        {/* SEO */}

        <button
          type='button'
          disabled={!!busy}
          onClick={generateSEO}
          className='px-3 py-2 text-xs rounded bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700'
        >

          {busy === 'seo'
            ? 'Generating...'
            : '🔍 Generate SEO'}

        </button>

        {/* THUMBNAIL */}

        <button
          type='button'
          disabled={!!busy}
          onClick={thumbnailIdea}
          className='px-3 py-2 text-xs rounded bg-pink-600 text-white disabled:opacity-50 hover:bg-pink-700'
        >

          {busy === 'thumbnail'
            ? 'Creating...'
            : '🎨 Thumbnail Idea'}

        </button>

        {/* QUICK ACTIONS */}

        {[
          ['summarize', '📝 Summary'],
          ['intro', '🎯 Better Intro'],
          ['social', '📣 Social Posts'],
          ['faq', '❓ FAQs'],
          ['conclusion', '✅ Conclusion']
        ].map(
          ([action, label]) => (

            <button
              key={action}
              type='button'
              disabled={!!busy}
              onClick={() =>
                quickAction(
                  action
                )
              }
              className='px-3 py-2 text-xs rounded bg-gray-800 text-white disabled:opacity-50 hover:bg-gray-900'
            >

              {busy === action
                ? 'Working...'
                : label}

            </button>

          )
        )}

        {/* COUNTER */}

        <button
          type='button'
          disabled={!!busy}
          onClick={counterPerspective}
          className='px-3 py-2 text-xs rounded bg-orange-600 text-white disabled:opacity-50 hover:bg-orange-700'
        >

          {busy === 'counter'
            ? 'Checking...'
            : '⚖️ Counter Perspective'}

        </button>

      </div>

      {/* =====================================================
          CHANGE BLOG TONE
      ===================================================== */}

      <div className='w-full mt-4'>

        <div className='bg-white border rounded-lg p-4'>

          <p className='text-sm font-semibold text-gray-800 mb-1'>
            🎭 Change Blog Tone
          </p>

          <p className='text-[11px] text-gray-500 mb-3'>
            AI will rewrite your current blog in the selected tone and replace the content directly in the editor.
          </p>

          <div className='flex flex-wrap gap-2'>

            {[
              [
                'professional',
                '💼 Professional'
              ],
              [
                'friendly',
                '😊 Friendly'
              ],
              [
                'casual',
                '😎 Casual'
              ],
              [
                'academic',
                '🎓 Academic'
              ],
              [
                'storytelling',
                '📖 Storytelling'
              ]
            ].map(
              ([tone, label]) => (

                <button
                  key={tone}
                  type='button'
                  disabled={!!busy}
                  onClick={() =>
                    changeTone(
                      tone
                    )
                  }
                  className='px-3 py-2 text-xs rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition'
                >

                  {busy === `tone-${tone}`
                    ? 'Applying...'
                    : label}

                </button>

              )
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          BLOG IDEAS
      ===================================================== */}

      <div className='w-full mt-4 bg-white border rounded-lg p-4'>

        <h3 className='font-semibold text-sm text-gray-800'>
          💡 AI Blog Ideas Generator
        </h3>

        <p className='text-xs text-gray-500 mt-1'>
          Enter a topic and let AI suggest unique blog ideas.
        </p>

        <div className='flex gap-2 mt-3'>

          <input
            type='text'
            value={ideaTopic}
            onChange={(e) =>
              setIdeaTopic(
                e.target.value
              )
            }
            placeholder='e.g. Artificial Intelligence'
            className='flex-1 border rounded px-3 py-2 text-xs outline-none'
          />

          <button
            type='button'
            disabled={!!busy}
            onClick={generateIdeas}
            className='px-4 py-2 text-xs rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700'
          >

            {busy === 'ideas'
              ? 'Generating...'
              : '💡 Generate Ideas'}

          </button>

        </div>

        {/* IDEAS */}

        {blogIdeas.length > 0 && (

          <div className='mt-4 space-y-3'>

            {blogIdeas.map(
              (idea, index) => (

                <div
                  key={index}
                  className='border rounded-lg p-3 bg-gray-50'
                >

                  <p className='text-xs font-semibold text-gray-800'>
                    {index + 1}. {idea.title}
                  </p>

                  {idea.angle && (

                    <p className='text-[11px] text-gray-600 mt-1'>
                      <b>Angle:</b>{' '}
                      {idea.angle}
                    </p>

                  )}

                  {idea.audience && (

                    <p className='text-[11px] text-gray-600 mt-1'>
                      <b>Audience:</b>{' '}
                      {idea.audience}
                    </p>

                  )}

                  <button
                    type='button'
                    onClick={() =>
                      copyText(
                        idea.title,
                        'Title copied'
                      )
                    }
                    className='mt-2 text-[10px] px-2 py-1 rounded bg-white border hover:bg-gray-100'
                  >
                    📋 Copy Title
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* =====================================================
          SEO RESULT
      ===================================================== */}

      {seo && (

        <div className='mt-4 bg-white border rounded-lg p-4'>

          <h3 className='font-semibold text-sm'>
            🔍 SEO Result
          </h3>

          {seo.metaTitle && (

            <p className='text-xs mt-2'>
              <b>Meta Title:</b>{' '}
              {seo.metaTitle}
            </p>

          )}

          {seo.metaDescription && (

            <p className='text-xs mt-1'>
              <b>Meta Description:</b>{' '}
              {seo.metaDescription}
            </p>

          )}

          {seo.slug && (

            <p className='text-xs mt-1'>
              <b>Slug:</b>{' '}
              {seo.slug}
            </p>

          )}

          {seo.focusKeyword && (

            <p className='text-xs mt-1'>
              <b>Focus Keyword:</b>{' '}
              {seo.focusKeyword}
            </p>

          )}

          {seo.seoKeywords?.length > 0 && (

            <div className='flex flex-wrap gap-1 mt-2'>

              {seo.seoKeywords.map(
                (keyword, index) => (

                  <span
                    key={index}
                    className='text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full'
                  >
                    {keyword}
                  </span>

                )
              )}

            </div>

          )}

          {seo.seoTips?.length > 0 && (

            <ul className='mt-2 text-xs text-gray-600 list-disc pl-5'>

              {seo.seoTips.map(
                (tip, index) => (

                  <li key={index}>
                    {tip}
                  </li>

                )
              )}

            </ul>

          )}

        </div>

      )}

      {/* =====================================================
          THUMBNAIL RESULT
      ===================================================== */}

      {thumbnail && (

        <div className='mt-4 bg-white border rounded-lg p-4'>

          <h3 className='font-semibold text-sm'>
            🎨 Thumbnail Concept
          </h3>

          {thumbnail.headline && (

            <p className='text-xs mt-2'>
              <b>Headline:</b>{' '}
              {thumbnail.headline}
            </p>

          )}

          {thumbnail.visualConcept && (

            <p className='text-xs mt-1'>
              <b>Visual:</b>{' '}
              {thumbnail.visualConcept}
            </p>

          )}

          {thumbnail.layout && (

            <p className='text-xs mt-1'>
              <b>Layout:</b>{' '}
              {thumbnail.layout}
            </p>

          )}

          {thumbnail.style && (

            <p className='text-xs mt-1'>
              <b>Style:</b>{' '}
              {thumbnail.style}
            </p>

          )}

          {thumbnail.imagePrompt && (

            <p className='text-xs mt-1'>
              <b>Image Prompt:</b>{' '}
              {thumbnail.imagePrompt}
            </p>

          )}

        </div>

      )}

      {/* =====================================================
          QUICK RESULT
      ===================================================== */}

      {quickResult && (

        <div className='mt-4 bg-white border rounded-lg p-4'>

          <h3 className='font-semibold text-sm'>
            🤖 AI Quick Result
          </h3>

          <div className='text-xs text-gray-700 whitespace-pre-wrap mt-2'>
            {quickResult}
          </div>

          <button
            type='button'
            onClick={() =>
              copyText(
                quickResult,
                'AI result copied'
              )
            }
            className='mt-3 text-[10px] px-2 py-1 rounded bg-white border hover:bg-gray-100'
          >
            📋 Copy Result
          </button>

        </div>

      )}

      {/* =====================================================
          COUNTER PERSPECTIVE
      ===================================================== */}

      {counter && (

        <div className='mt-4 bg-white border rounded-lg p-4'>

          <h3 className='font-semibold text-sm'>
            ⚖️ Constructive Counter Perspective
          </h3>

          {counter.assumptions?.length > 0 && (

            <>
              <p className='text-xs font-semibold mt-2'>
                Assumptions
              </p>

              <ul className='text-xs list-disc pl-5'>

                {counter.assumptions.map(
                  (item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  )
                )}

              </ul>
            </>

          )}

          {counter.missingViewpoints?.length > 0 && (

            <>
              <p className='text-xs font-semibold mt-2'>
                Missing Viewpoints
              </p>

              <ul className='text-xs list-disc pl-5'>

                {counter.missingViewpoints.map(
                  (item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  )
                )}

              </ul>
            </>

          )}

          {counter.counterArgument && (

            <>
              <p className='text-xs font-semibold mt-2'>
                Counter Argument
              </p>

              <p className='text-xs text-gray-700'>
                {counter.counterArgument}
              </p>
            </>

          )}

        </div>

      )}

      {/* =====================================================
          ASK AI
      ===================================================== */}

      <div className='mt-4 bg-white border rounded-lg p-4'>

        <h3 className='font-semibold text-sm'>
          💬 Ask AI About This Blog
        </h3>

        <div className='flex gap-2 mt-2'>

          <input
            value={question}
            onChange={(e) =>
              setQuestion(
                e.target.value
              )
            }
            placeholder='e.g. What is the main takeaway?'
            className='flex-1 border rounded px-3 py-2 text-xs outline-none'
          />

          <button
            type='button'
            disabled={!!busy}
            onClick={ask}
            className='px-4 py-2 text-xs rounded bg-green-600 text-white disabled:opacity-50 hover:bg-green-700'
          >

            {busy === 'ask'
              ? '...'
              : 'Ask'}

          </button>

        </div>

        {answer && (

          <div className='mt-3'>

            <p className='text-xs text-gray-700 whitespace-pre-wrap'>
              {answer}
            </p>

            <button
              type='button'
              onClick={() =>
                copyText(
                  answer,
                  'Answer copied'
                )
              }
              className='mt-2 text-[10px] px-2 py-1 rounded bg-white border hover:bg-gray-100'
            >
              📋 Copy Answer
            </button>

          </div>

        )}

      </div>

    </div>

  )

}

export default AIStudio