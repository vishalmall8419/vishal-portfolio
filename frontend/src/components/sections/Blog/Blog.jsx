import { useNavigate } from "react-router-dom";
import "./Blog.css";
import GlassCard from "../../ui/GlassCard";
import SectionTitle from "../../ui/SectionTitle";
import Button from "../../ui/Button";
import usePublicData from "../../../hooks/usePublicData";
import { publicApi, resolveAssetUrl } from "../../../lib/publicApi";

// Fallback only used if the Blogs CMS resource is empty/unreachable.
const FALLBACK_BLOGS = [
  { id: 1, category: "Java", title: "Building Enterprise Applications with Java", description: "Learn how to create scalable Java applications using modern architecture and best practices.", date: "12 Jul 2026", readTime: "8 min read" },
  { id: 2, category: "React", title: "Creating Premium UI with React & Tailwind CSS", description: "A complete guide to building responsive and beautiful user interfaces.", date: "08 Jul 2026", readTime: "6 min read" },
  { id: 3, category: "Full Stack", title: "Node.js, Express & MySQL REST API Guide", description: "Build secure, scalable and production-ready REST APIs from scratch.", date: "01 Jul 2026", readTime: "10 min read" },
];

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Blog() {
  const { data, loading } = usePublicData(() => publicApi.blogs(), []);
  const navigate = useNavigate();
  const blogs =
    !loading && Array.isArray(data) && data.length
      ? data.map((row) => ({
          id: row.id,
          slug: row.slug,
          category: row.category,
          title: row.title,
          description: row.excerpt,
          image: row.coverImage,
          date: formatDate(row.publishedAt),
          readTime: `${row.readTime || 1} min read`,
        }))
      : FALLBACK_BLOGS;

  return (
    <section className="vm-blog">

      <div className="vm-blog-container">

        <SectionTitle
          subtitle="BLOG"
          title="Latest"
          highlight=" Articles"
          description="Sharing tutorials, development tips and experiences from my software engineering journey."
          align="center"
        />

        <div className="vm-blog-grid">

          {blogs.map((blog) => (

            <GlassCard
              key={blog.id}
              className="vm-blog-card"
            >

              <div className="vm-blog-image">
                {blog.image ? (
                  <img src={resolveAssetUrl(blog.image)} alt={blog.title} />
                ) : (
                  "BLOG IMAGE"
                )}
              </div>

              <span className="vm-blog-category">
                {blog.category}
              </span>

              <h3>{blog.title}</h3>

              <p>{blog.description}</p>

              <div className="vm-blog-footer">

                <small>{blog.date}</small>

                <small>{blog.readTime}</small>

              </div>

              <Button onClick={() => navigate(`/blog/${blog.slug || blog.id}`)}>
                Read More
              </Button>

            </GlassCard>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Blog;
