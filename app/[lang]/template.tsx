// Unlike a layout, a template is remounted on every navigation, so each page fades in as it
// arrives. `page-in` ends cleanly (no held end frame), so once it is over the wrapper is not
// left as a stacking context that would trap the fixed layers inside it (contents drawer, button).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="motion-safe:animate-page-in">{children}</div>
}
