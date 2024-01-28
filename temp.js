// Dada Ki Jay Ho
const { faker } = require('@faker-js/faker');
const fs = require('fs');

const generateBlogList = (numBlogs) => {
  const blogList = [];

  for (let i = 1; i <= numBlogs; i++) {
    const blog = {
      id: i,
      title: `Let's learn about ${faker.random.word()}`,
      body: faker.lorem.paragraph()
    };

    blogList.push(blog);
  }

  return blogList;
};

const numberOfBlogs = 1000;
const blogs = generateBlogList(numberOfBlogs);

const jsonContent = JSON.stringify(blogs, null, 2);

fs.writeFileSync('blogs.json', jsonContent, 'utf-8');
console.log('Blogs data has been generated and saved to blogs.json.');
