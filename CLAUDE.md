# Frontend guidelines for Next.js and React
+ Intentional use of .ts or .tsx suffixes
+ Use Tailwind for styles
+ Use the image component of next. It's good practice to set the width and height of your images to avoid layout shift, these should be an aspect ratio identical to the source image. These values are not the size the image is rendered, but instead the size of the actual image file used to understand the aspect ratio."
+ Think about rendering strategies carefully, all the options that offer Next.js
+ Use Streaming when needing
+ Use the notFound function and not-found file to handle 404 errors (for resources that don’t exist).
+ Use field validations on Next.js server side
+ You need to add good covergae of unit tests in the frontend

# Django and Django rest guidelines
+ Use JWT for auth
+ Use BaseUser model and adapt it to use case
+ Bakcend should run in a docker container
+ Use a NEXT_PUBLIC_API_URL env var for the Django base URL so you can swap localhost ↔ production.
+ Proper use of perform_create/perform_update hooks, user-scoped querysets, proper foreign key constraints
+ You need to add good covergae of unit tests in the bakcend, use own Django test features for those.

# Other notes
+ Add a detailed readme with all required context to understand project and run it
+ All Git commits should be manually confirmed by user. All commits should be on my name, not yours
Git user email: user.email=18686600+pedrorojasg@users.noreply.github.com
