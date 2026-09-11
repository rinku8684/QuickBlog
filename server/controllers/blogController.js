import fs from "fs";
import mongoose from "mongoose";
import imagekit from "../configs/imagekit.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import main from "../configs/gemini.js";

// =====================================================
// ERROR MESSAGE HELPER
// =====================================================

const extractErrorMessage = (error) => {
    const raw = error?.message ? error.message : String(error);

    if (typeof raw !== "string") {
        return "Something went wrong";
    }

    const trimmed = raw.trim();

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
            const parsed = JSON.parse(trimmed);

            if (parsed?.error) {
                const code = parsed.error.code;
                const topMsg = parsed.error.message || "";

                const reason =
                    parsed.error.details?.find?.(
                        (d) => d.reason
                    )?.reason;

                const localized =
                    parsed.error.details?.find?.(
                        (d) => d.message
                    )?.message;

                let clean =
                    localized ||
                    topMsg ||
                    "AI request failed";

                if (
                    reason === "API_KEY_INVALID" ||
                    topMsg
                        ?.toLowerCase()
                        .includes("api key not valid")
                ) {
                    clean =
                        "Invalid Gemini API key. Check GEMINI_API_KEY in server/.env.";
                } else if (code === 401 || code === 403) {
                    clean =
                        topMsg ||
                        "Authentication error. Check your GEMINI_API_KEY.";
                } else if (code === 429) {
                    clean =
                        "Gemini free-tier quota exceeded. Please try again later.";
                }

                return clean;
            }

            if (parsed?.message) {
                return String(parsed.message);
            }

            return trimmed.slice(0, 200);

        } catch (_) {
            return trimmed.slice(0, 200);
        }
    }

    return raw;
};

// =====================================================
// WAIT FOR DATABASE
// =====================================================

const waitForDB = async (timeoutMs = 30000) => {

    const start = Date.now();

    while (mongoose.connection.readyState !== 1) {

        if (Date.now() - start > timeoutMs) {
            throw new Error(
                `Database not ready (state: ${mongoose.connection.readyState}). Check MongoDB connection.`
            );
        }

        await new Promise((resolve) =>
            setTimeout(resolve, 200)
        );
    }
};

// =====================================================
// ADD BLOG
// =====================================================
// USER BLOG WILL BE DIRECTLY PUBLISHED
// No admin approval required
// =====================================================

export const addBlog = async (req, res) => {

    let imageFilePath = null;

    try {

        const blogData = JSON.parse(
            req.body.blog || "{}"
        );

        const {
            title,
            subTitle,
            description,
            category,
            metaTitle,
            metaDescription,
            slug,
            focusKeyword,
            seoKeywords,
            seoTips
        } = blogData;

        const imageFile = req.file;

        if (imageFile) {
            imageFilePath = imageFile.path;
        }

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (
            !title?.trim() ||
            !description?.trim() ||
            !category?.trim() ||
            !imageFile
        ) {

            return res.json({
                success: false,
                message: "Missing required fields"
            });
        }

        // ---------------------------------------------
        // READ IMAGE
        // ---------------------------------------------

        const fileBuffer = fs.readFileSync(
            imageFile.path
        );

        // ---------------------------------------------
        // UPLOAD IMAGE TO IMAGEKIT
        // ---------------------------------------------

        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/blogs"
        });

        // ---------------------------------------------
        // OPTIMIZE IMAGE
        // ---------------------------------------------

        const optimizedImageUrl = imagekit.url({
            path: response.filePath,

            transformation: [
                {
                    quality: "auto"
                },
                {
                    format: "webp"
                },
                {
                    width: "1280"
                }
            ]
        });

        // ---------------------------------------------
        // DATABASE
        // ---------------------------------------------

        await waitForDB();

        // ---------------------------------------------
        // IMPORTANT
        // USER BLOG = DIRECTLY PUBLISHED
        // ---------------------------------------------

        await Blog.create({

            title: title.trim(),

            subTitle:
                subTitle?.trim() || "",

            description,

            category:
                category.trim(),

            image:
                optimizedImageUrl,

            // USER BLOG DIRECTLY PUBLISHED
            isPublished: true,

            metaTitle:
                metaTitle || "",

            metaDescription:
                metaDescription || "",

            slug:
                slug || "",

            focusKeyword:
                focusKeyword || "",

            seoKeywords:
                Array.isArray(seoKeywords)
                    ? seoKeywords
                    : [],

            seoTips:
                Array.isArray(seoTips)
                    ? seoTips
                    : []
        });

        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        res.json({
            success: true,
            message:
                "Blog published successfully"
        });

    } catch (error) {

        console.error(
            "Add Blog Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });

    } finally {

        // ---------------------------------------------
        // DELETE TEMPORARY IMAGE
        // ---------------------------------------------

        if (
            imageFilePath &&
            fs.existsSync(imageFilePath)
        ) {

            try {
                fs.unlinkSync(imageFilePath);
            } catch (_) {}

        }
    }
};

// =====================================================
// GET ALL PUBLISHED BLOGS
// =====================================================

export const getAllBlogs = async (req, res) => {

    try {

        await waitForDB();

        const blogs = await Blog.find({
            isPublished: true
        })
            .sort({
                createdAt: -1
            });

        res.json({
            success: true,
            blogs
        });

    } catch (error) {

        console.error(
            "Get All Blogs Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// GET BLOG BY ID
// =====================================================

export const getBlogById = async (req, res) => {

    try {

        const { blogId } = req.params;

        await waitForDB();

        const blog =
            await Blog.findById(blogId);

        if (!blog) {

            return res.json({
                success: false,
                message:
                    "Blog not found"
            });
        }

        res.json({
            success: true,
            blog
        });

    } catch (error) {

        console.error(
            "Get Blog By ID Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// DELETE BLOG
// =====================================================

export const deleteBlogById = async (req, res) => {

    try {

        const { id } = req.body;

        if (!id) {

            return res.json({
                success: false,
                message:
                    "Blog id is required"
            });
        }

        await waitForDB();

        const blog =
            await Blog.findById(id);

        if (!blog) {

            return res.json({
                success: false,
                message:
                    "Blog not found"
            });
        }

        await Blog.findByIdAndDelete(id);

        // Delete related comments
        await Comment.deleteMany({
            blog: id
        });

        res.json({
            success: true,
            message:
                "Blog deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete Blog Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// TOGGLE PUBLISH / UNPUBLISH
// =====================================================
// ADMIN CAN CONTROL BLOG VISIBILITY
// =====================================================

export const togglePublish = async (req, res) => {

    try {

        const { id } = req.body;

        if (!id) {

            return res.json({
                success: false,
                message:
                    "Blog id is required"
            });
        }

        await waitForDB();

        const blog =
            await Blog.findById(id);

        if (!blog) {

            return res.json({
                success: false,
                message:
                    "Blog not found"
            });
        }

        // Toggle status
        blog.isPublished =
            !blog.isPublished;

        await blog.save();

        res.json({
            success: true,

            message:
                blog.isPublished
                    ? "Blog published successfully"
                    : "Blog unpublished successfully",

            isPublished:
                blog.isPublished
        });

    } catch (error) {

        console.error(
            "Toggle Publish Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// ADD COMMENT
// =====================================================

export const addComment = async (req, res) => {

    try {

        const {
            blog,
            name,
            content
        } = req.body;

        if (
            !blog ||
            !name ||
            !content
        ) {

            return res.json({
                success: false,
                message:
                    "Missing required fields"
            });
        }

        await waitForDB();

        await Comment.create({

            blog,

            name,

            content,

            // Comment still requires admin approval
            isApproved: false
        });

        res.json({
            success: true,
            message:
                "Comment added for review"
        });

    } catch (error) {

        console.error(
            "Add Comment Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// GET BLOG COMMENTS
// =====================================================

export const getBlogComments = async (req, res) => {

    try {

        const { blogId } =
            req.body;

        if (!blogId) {

            return res.json({
                success: false,
                message:
                    "Blog id is required"
            });
        }

        await waitForDB();

        const comments =
            await Comment.find({

                blog: blogId,

                isApproved: true

            })
                .populate(
                    "blog",
                    "title"
                )
                .sort({
                    createdAt: -1
                });

        res.json({
            success: true,
            comments
        });

    } catch (error) {

        console.error(
            "Get Blog Comments Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// GENERATE BLOG CONTENT USING GEMINI
// =====================================================

export const generateContent = async (req, res) => {

    try {

        const { prompt } =
            req.body;

        if (!prompt?.trim()) {

            return res.json({
                success: false,
                message:
                    "Prompt is required"
            });
        }

        const content =
            await main(
                prompt +
                " Generate a blog content for this topic in simple text format"
            );

        res.json({
            success: true,
            content
        });

    } catch (error) {

        console.error(
            "AI Generate Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// ANALYZE BLOG CONTENT USING GEMINI
// =====================================================

export const analyzeContent = async (req, res) => {

    try {

        const {
            title,
            subTitle,
            content,
            description,
            category
        } = req.body;

        const blogContent =
            content?.trim() ||
            description?.trim() ||
            "";

        if (
            !title?.trim() ||
            !blogContent
        ) {

            return res.json({
                success: false,
                message:
                    "Blog title and content are required"
            });
        }

        const prompt = `
You are an expert blog editor and content quality analyst.

Analyze the following blog and return ONLY valid JSON.

IMPORTANT:
- Do not use markdown.
- Do not add explanation outside the JSON.
- Use simple language.
- Give realistic scores between 0 and 100.
- Do not invent information.

BLOG TITLE:
${title}

BLOG SUBTITLE:
${subTitle || ""}

BLOG CATEGORY:
${category || "General"}

BLOG CONTENT:
${blogContent}

Evaluate the blog using these five scores:

1. qualityScore
2. seoScore
3. readabilityScore
4. structureScore
5. engagementScore

Each score must be an integer between 0 and 100.

Also provide:

- summary: short overall summary
- strengths: maximum 3 points
- weaknesses: maximum 3 points
- suggestions: maximum 5 actionable suggestions
- keywords: maximum 8 useful SEO keywords
- betterTitle: one improved SEO-friendly title

Return EXACTLY this JSON structure:

{
    "qualityScore": 0,
    "seoScore": 0,
    "readabilityScore": 0,
    "structureScore": 0,
    "engagementScore": 0,
    "summary": "",
    "strengths": [],
    "weaknesses": [],
    "suggestions": [],
    "keywords": [],
    "betterTitle": ""
}
`;

        const result =
            await main(prompt);

        let cleanedResult =
            String(result || "")
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

        let analysis;

        try {

            analysis =
                JSON.parse(
                    cleanedResult
                );

        } catch (parseError) {

            console.error(
                "Gemini JSON Parse Error:",
                parseError
            );

            console.error(
                "Gemini Raw Response:",
                result
            );

            return res.json({
                success: false,
                message:
                    "AI returned an invalid analysis format. Please try again."
            });
        }

        const scoreFields = [

            "qualityScore",

            "seoScore",

            "readabilityScore",

            "structureScore",

            "engagementScore"

        ];

        for (
            const field of scoreFields
        ) {

            const score =
                Number(
                    analysis[field]
                );

            if (
                !Number.isFinite(score) ||
                score < 0 ||
                score > 100
            ) {

                return res.json({
                    success: false,
                    message:
                        `Invalid AI score received for ${field}`
                });
            }

            analysis[field] =
                Math.round(score);
        }

        analysis.strengths =
            Array.isArray(
                analysis.strengths
            )
                ? analysis.strengths
                : [];

        analysis.weaknesses =
            Array.isArray(
                analysis.weaknesses
            )
                ? analysis.weaknesses
                : [];

        analysis.suggestions =
            Array.isArray(
                analysis.suggestions
            )
                ? analysis.suggestions
                : [];

        analysis.keywords =
            Array.isArray(
                analysis.keywords
            )
                ? analysis.keywords
                : [];

        analysis.summary =
            typeof analysis.summary === "string"
                ? analysis.summary
                : "";

        analysis.betterTitle =
            typeof analysis.betterTitle === "string"
                ? analysis.betterTitle
                : "";

        analysis.overallScore =
            Math.round(
                (
                    analysis.qualityScore +
                    analysis.seoScore +
                    analysis.readabilityScore +
                    analysis.structureScore +
                    analysis.engagementScore
                ) / 5
            );

        res.json({
            success: true,
            analysis
        });

    } catch (error) {

        console.error(
            "AI Analysis Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// IMPROVE BLOG CONTENT USING GEMINI
// =====================================================

export const improveContent = async (req, res) => {

    try {

        const {
            title,
            subTitle,
            description,
            category,
            suggestions
        } = req.body;

        if (!description) {

            return res.json({
                success: false,
                message:
                    "Blog description is required"
            });
        }

        const prompt = `
You are an expert blog editor.

Improve the following blog content.

Title:
${title || ""}

Subtitle:
${subTitle || ""}

Category:
${category || ""}

Current Blog Content:
${description}

User Suggestions:
${
    suggestions ||
    "Make it clearer, more professional, engaging and easy to read."
}

Instructions:
- Improve grammar and sentence structure.
- Make the content professional and engaging.
- Keep the original meaning.
- Do not add unrelated information.
- Improve headings and paragraphs where necessary.
- Keep the language simple and easy to understand.
- Return only the improved blog content.
`;

        const content =
            await main(prompt);

        res.json({
            success: true,
            content
        });

    } catch (error) {

        console.error(
            "AI Improvement Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// AI CONTENT STUDIO - HELPERS
// =====================================================

const cleanAIJson = (value) => {

    const text =
        String(value || "")
            .replace(
                /^```json\s*/i,
                ""
            )
            .replace(
                /^```\s*/i,
                ""
            )
            .replace(
                /\s*```$/i,
                ""
            )
            .trim();

    try {

        return JSON.parse(text);

    } catch {

        const start =
            text.indexOf("{");

        const end =
            text.lastIndexOf("}");

        if (
            start !== -1 &&
            end > start
        ) {

            return JSON.parse(
                text.slice(
                    start,
                    end + 1
                )
            );
        }

        throw new Error(
            "AI returned invalid JSON. Please try again."
        );
    }
};

const aiStudioContent =
    (description) =>
        String(
            description || ""
        ).trim();

// =====================================================
// GENERATE SEO
// =====================================================

export const generateSEO = async (
    req,
    res
) => {

    try {

        const {
            title,
            subTitle,
            description,
            category
        } = req.body;

        if (
            !title?.trim() ||
            !aiStudioContent(
                description
            )
        ) {

            return res.json({
                success: false,
                message:
                    "Title and blog content are required"
            });
        }

        const prompt = `
You are an expert SEO editor for a professional blog website.

Return ONLY valid JSON and no markdown.

Title:
${title}

Subtitle:
${subTitle || ""}

Category:
${category || "General"}

Content:
${description}

Return exactly:

{
  "metaTitle": "SEO-friendly title under 60 characters",
  "metaDescription": "SEO-friendly description under 160 characters",
  "slug": "lowercase-hyphen-separated-slug",
  "focusKeyword": "one primary keyword",
  "seoKeywords": [
    "keyword1",
    "keyword2",
    "keyword3",
    "keyword4",
    "keyword5"
  ],
  "seoTips": [
    "tip1",
    "tip2",
    "tip3"
  ]
}
`;

        const result =
            cleanAIJson(
                await main(prompt)
            );

        res.json({
            success: true,
            seo: result
        });

    } catch (error) {

        console.error(
            "Generate SEO Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// THUMBNAIL IDEA
// =====================================================

export const thumbnailIdea = async (
    req,
    res
) => {

    try {

        const {
            title,
            category
        } = req.body;

        if (!title?.trim()) {

            return res.json({
                success: false,
                message:
                    "Blog title is required"
            });
        }

        const prompt = `
Create a professional blog thumbnail concept.

Return ONLY valid JSON.

Title:
${title}

Category:
${category || "General"}

Return:

{
  "headline": "short thumbnail headline",
  "visualConcept": "main visual idea",
  "layout": "layout description",
  "style": "visual style",
  "imagePrompt": "detailed prompt for an image generator"
}
`;

        const idea =
            cleanAIJson(
                await main(prompt)
            );

        res.json({
            success: true,
            idea
        });

    } catch (error) {

        console.error(
            "Thumbnail Idea Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// QUICK AI ACTION
// =====================================================

export const quickAction = async (
    req,
    res
) => {

    try {

        const {
            action,
            title,
            description,
            category
        } = req.body;

        if (
            !action ||
            !aiStudioContent(
                description
            )
        ) {

            return res.json({
                success: false,
                message:
                    "Action and blog content are required"
            });
        }

        const instructions = {

            summarize:
                "Create a concise summary of the blog in 5-7 clear sentences.",

            intro:
                "Write a stronger, engaging introduction for this blog while keeping its topic and meaning.",

            social:
                "Create 3 short social media posts promoting this blog. Make them platform-friendly and engaging.",

            faq:
                "Create 5 useful FAQs with short answers based only on the blog content.",

            conclusion:
                "Write a strong conclusion that summarizes the key message and gives the reader a useful final takeaway."

        };

        const instruction =
            instructions[action];

        if (!instruction) {

            return res.json({
                success: false,
                message:
                    "Unsupported AI action"
            });
        }

        const prompt = `
You are a professional blog editor.

Title:
${title || ""}

Category:
${category || "General"}

Blog:
${description}

Task:
${instruction}

Return only the requested content.

Keep language simple, useful and professional.
`;

        const result =
            await main(prompt);

        res.json({
            success: true,
            content: result
        });

    } catch (error) {

        console.error(
            "Quick Action Error:",
            error
        );

        res.json({
            success: false,
            message:
                extractErrorMessage(error)
        });
    }
};

// =====================================================
// COUNTER PERSPECTIVE
// =====================================================

export const counterPerspective =
    async (req, res) => {

        try {

            const {
                title,
                description,
                category
            } = req.body;

            if (
                !aiStudioContent(
                    description
                )
            ) {

                return res.json({
                    success: false,
                    message:
                        "Blog content is required"
                });
            }

            const prompt = `
Analyze this blog constructively and identify viewpoints that the author may have missed.

Return ONLY valid JSON.

Title:
${title || ""}

Category:
${category || "General"}

Blog:
${description}

Return exactly:

{
  "assumptions": [
    "up to 3 assumptions"
  ],
  "missingViewpoints": [
    "up to 3 missing viewpoints"
  ],
  "counterArgument":
    "one balanced counter-argument"
}

Do not invent facts that are not reasonably implied by the blog.
`;

            const perspective =
                cleanAIJson(
                    await main(prompt)
                );

            res.json({
                success: true,
                perspective
            });

        } catch (error) {

            console.error(
                "Counter Perspective Error:",
                error
            );

            res.json({
                success: false,
                message:
                    extractErrorMessage(error)
            });
        }
    };

// =====================================================
// ASK ABOUT BLOG
// =====================================================

export const askAboutBlog =
    async (req, res) => {

        try {

            const {
                question,
                title,
                description,
                category
            } = req.body;

            if (!question?.trim()) {

                return res.json({
                    success: false,
                    message:
                        "Question is required"
                });
            }

            if (
                !aiStudioContent(
                    description
                )
            ) {

                return res.json({
                    success: false,
                    message:
                        "Blog content is required"
                });
            }

            const prompt = `
Answer the user's question using the blog below.

Do not claim information that is not in the blog unless clearly marked as general context.

Use simple language.

Title:
${title || ""}

Category:
${category || "General"}

Blog:
${description}

Question:
${question}
`;

            const answer =
                await main(prompt);

            res.json({
                success: true,
                answer
            });

        } catch (error) {

            console.error(
                "Ask AI Error:",
                error
            );

            res.json({
                success: false,
                message:
                    extractErrorMessage(error)
            });
        }
    };

// =====================================================
// CHANGE TONE
// =====================================================

export const changeTone =
    async (req, res) => {

        try {

            const {
                title,
                description,
                category,
                tone
            } = req.body;

            const allowed = [
                "professional",
                "friendly",
                "casual",
                "academic",
                "storytelling"
            ];

            if (
                !allowed.includes(tone)
            ) {

                return res.json({
                    success: false,
                    message:
                        "Invalid tone"
                });
            }

            if (
                !aiStudioContent(
                    description
                )
            ) {

                return res.json({
                    success: false,
                    message:
                        "Blog content is required"
                });
            }

            const prompt = `
Rewrite the following blog in a ${tone} tone.

Keep the original meaning, facts, topic, headings and useful information.

Do not add unrelated claims.

Return only the rewritten blog content.

Title:
${title || ""}

Category:
${category || "General"}

Blog:
${description}
`;

            const content =
                await main(prompt);

            res.json({
                success: true,
                content
            });

        } catch (error) {

            console.error(
                "Change Tone Error:",
                error
            );

            res.json({
                success: false,
                message:
                    extractErrorMessage(error)
            });
        }
    };

// =====================================================
// GENERATE BLOG IDEAS
// =====================================================

export const generateIdeas =
    async (req, res) => {

        try {

            const {
                topic,
                category,
                count = 5
            } = req.body;

            if (
                !topic?.trim() &&
                !category?.trim()
            ) {

                return res.json({
                    success: false,
                    message:
                        "Topic or category is required"
                });
            }

            const safeCount =
                Math.min(
                    Math.max(
                        Number(count) || 5,
                        1
                    ),
                    10
                );

            const prompt = `
Generate ${safeCount} original and useful blog ideas.

Return ONLY valid JSON.

Topic:
${topic || ""}

Category:
${category || "General"}

Avoid generic or repeated titles.

Return exactly:

{
  "ideas": [
    {
      "title": "...",
      "angle": "...",
      "audience": "..."
    }
  ]
}
`;

            const result =
                cleanAIJson(
                    await main(prompt)
                );

            res.json({
                success: true,
                ideas:
                    Array.isArray(
                        result.ideas
                    )
                        ? result.ideas
                        : []
            });

        } catch (error) {

            console.error(
                "Generate Ideas Error:",
                error
            );

            res.json({
                success: false,
                message:
                    extractErrorMessage(error)
            });
        }
    };

// =====================================================
// UPDATE BLOG
// =====================================================

export const updateBlog =
    async (req, res) => {

        let imageFilePath = null;

        try {

            const blogData =
                JSON.parse(
                    req.body.blog || "{}"
                );

            const {
                id,
                title,
                subTitle,
                description,
                category,
                isPublished
            } = blogData;

            const imageFile =
                req.file;

            if (
                !id ||
                !title?.trim() ||
                !description?.trim() ||
                !category?.trim()
            ) {

                return res.json({
                    success: false,
                    message:
                        "Blog id, title, content and category are required"
                });
            }

            await waitForDB();

            const blog =
                await Blog.findById(id);

            if (!blog) {

                return res.json({
                    success: false,
                    message:
                        "Blog not found"
                });
            }

            const update = {

                title:
                    title.trim(),

                subTitle:
                    subTitle || "",

                description,

                category,

                isPublished:
                    Boolean(
                        isPublished
                    ),

                metaTitle:
                    blogData.metaTitle ||
                    blog.metaTitle,

                metaDescription:
                    blogData.metaDescription ||
                    blog.metaDescription,

                slug:
                    blogData.slug ||
                    blog.slug,

                focusKeyword:
                    blogData.focusKeyword ||
                    blog.focusKeyword,

                seoKeywords:
                    Array.isArray(
                        blogData.seoKeywords
                    )
                        ? blogData.seoKeywords
                        : blog.seoKeywords,

                seoTips:
                    Array.isArray(
                        blogData.seoTips
                    )
                        ? blogData.seoTips
                        : blog.seoTips
            };

            // -----------------------------------------
            // NEW IMAGE
            // -----------------------------------------

            if (imageFile) {

                imageFilePath =
                    imageFile.path;

                const fileBuffer =
                    fs.readFileSync(
                        imageFile.path
                    );

                const response =
                    await imagekit.upload({

                        file:
                            fileBuffer,

                        fileName:
                            imageFile.originalname,

                        folder:
                            "/blogs"

                    });

                update.image =
                    imagekit.url({

                        path:
                            response.filePath,

                        transformation: [

                            {
                                quality:
                                    "auto"
                            },

                            {
                                format:
                                    "webp"
                            },

                            {
                                width:
                                    "1280"
                            }

                        ]
                    });
            }

            await Blog.findByIdAndUpdate(
                id,
                update,
                {
                    new: true,
                    runValidators: true
                }
            );

            res.json({
                success: true,
                message:
                    "Blog updated successfully"
            });

        } catch (error) {

            console.error(
                "Update Blog Error:",
                error
            );

            res.json({
                success: false,
                message:
                    extractErrorMessage(error)
            });

        } finally {

            if (imageFilePath) {

                try {

                    fs.unlinkSync(
                        imageFilePath
                    );

                } catch (_) {}

            }
        }
    };

// =====================================================
// GET PENDING COMMENTS - ADMIN
// =====================================================

export const getPendingComments =
    async (req, res) => {

        try {

            await waitForDB();

            const comments =
                await Comment.find({
                    isApproved: false
                })
                    .populate(
                        "blog",
                        "title"
                    )
                    .sort({
                        createdAt: -1
                    });

            res.json({
                success: true,
                comments
            });

        } catch (error) {

            console.error(
                "Get Pending Comments Error:",
                error
            );

            res.json({
                success: false,
                message:
                    extractErrorMessage(error)
            });
        }
    };

// =====================================================
// APPROVE COMMENT - ADMIN
// =====================================================

export const approveComment =
    async (req, res) => {

        try {

            const { id } =
                req.body;

            if (!id) {

                return res.json({
                    success: false,
                    message:
                        "Comment id is required"
                });
            }

            await waitForDB();

            const comment =
                await Comment.findById(id);

            if (!comment) {

                return res.json({
                    success: false,
                    message:
                        "Comment not found"
                });
            }

            comment.isApproved =
                true;

            await comment.save();

            res.json({
                success: true,
                message:
                    "Comment approved successfully"
            });

        } catch (error) {

            console.error(
                "Approve Comment Error:",
                error
            );

            res.json({
                success: false,
                message:
                    extractErrorMessage(error)
            });
        }
    };

// =====================================================
// DELETE COMMENT - ADMIN
// =====================================================

export const deleteComment =
    async (req, res) => {

        try {

            const { id } =
                req.body;

            if (!id) {

                return res.json({
                    success: false,
                    message:
                        "Comment id is required"
                });
            }

            await waitForDB();

            const comment =
                await Comment.findById(id);

            if (!comment) {

                return res.json({
                    success: false,
                    message:
                        "Comment not found"
                });
            }

            await Comment.findByIdAndDelete(
                id
            );

            res.json({
                success: true,
                message:
                    "Comment deleted successfully"
            });

        } catch (error) {

            console.error(
                "Delete Comment Error:",
                error
            );

            res.json({
                success: false,
                message:
                    extractErrorMessage(error)
            });
        }
    };