import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCalendar, FiClock, FiUser, FiArrowLeft } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import useTheme from "../../hooks/useTheme";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import "./BlogPost.css";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function BlogPost() {
  const { slug } = useParams();
  const { siteSettings } = useTheme();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    publicApi
      .blogBySlug(slug)
      .then(({ data }) => {
        if (!cancelled) {
          setPost(data?.data ?? null);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const authorName = siteSettings?.name || "Vishal Mall";

  return (
    <>
      <main className="blogpost-page">
        <Navbar />

        {status === "loading" && (
          <div className="blogpost-state">Loading post...</div>
        )}

        {status === "error" && (
          <div className="blogpost-state">
            <h2>Post not found</h2>
            <p>This blog post doesn&rsquo;t exist or may have been unpublished.</p>
            <Link to="/blog" className="blogpost-back">
              <FiArrowLeft /> Back to Blog
            </Link>
          </div>
        )}

        {status === "ready" && post && (
          <article className="blogpost-article">
            <Link to="/blog" className="blogpost-back">
              <FiArrowLeft /> Back to Blog
            </Link>

            {post.category && <span className="blogpost-tag">{post.category}</span>}

            <h1 className="blogpost-title">{post.title}</h1>

            <div className="blogpost-meta">
              <span><FiUser /> {authorName}</span>
              {post.publishedAt && <span><FiCalendar /> {formatDate(post.publishedAt)}</span>}
              {post.readTime && <span><FiClock /> {post.readTime} min read</span>}
            </div>

            {post.coverImage && (
              <div className="blogpost-cover">
                <img src={resolveAssetUrl(post.coverImage)} alt={post.title} />
              </div>
            )}

            {/* Content is authored as HTML in the admin editor by design. */}
            <div className="blogpost-content" dangerouslySetInnerHTML={{ __html: post.content }} />

            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="blogpost-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="blogpost-tag-chip">#{tag}</span>
                ))}
              </div>
            )}
          </article>
        )}
      </main>
      <Footer />
    </>
  );
}

export default BlogPost;
