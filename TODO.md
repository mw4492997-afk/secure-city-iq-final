# TODO: Make /login the default page

- [x] Modify app/login/page.tsx: Add localStorage.setItem('session', 'active') after successful password check.
- [x] Modify app/page.tsx: Import useRouter, add useEffect to check session and redirect to /login if not active.
- [x] Test the application to ensure redirection works.
- [x] Commit and push changes to main branch with git push origin main --force.
