import { useState } from "react";
import "./FAQ.css";

const faqs = [
  {
    question: "What technologies do you specialize in?",
    answer:
      "I specialize in Java, React, Spring Boot, Node.js, Express.js, MySQL, JavaScript and modern frontend development.",
  },
  {
    question: "Are you available for freelance projects?",
    answer:
      "Yes. I am available for freelance work, internships and full-time opportunities.",
  },
  {
    question: "Do you build full stack applications?",
    answer:
      "Yes. I build complete full stack web applications from UI design to backend APIs and database integration.",
  },
  {
    question: "Which database do you use?",
    answer:
      "I primarily use MySQL and I'm also learning MongoDB.",
  },
];

function FAQ() {
  const [active, setActive] = useState(0);

  return (
    <section className="vm-faq">

      <div className="vm-faq-container">

        <h2>Frequently Asked Questions</h2>

        {faqs.map((item, index) => (

          <div
            key={index}
            className={`vm-faq-item ${
              active === index ? "active" : ""
            }`}
          >

            <button
              onClick={() =>
                setActive(active === index ? -1 : index)
              }
            >
              {item.question}
            </button>

            <div className="vm-faq-answer">
              <p>{item.answer}</p>
            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default FAQ;