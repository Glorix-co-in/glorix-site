export default function NotFound(props: { message?: string }) {
  return (
    <main id="main-content">
      <h1>{props.message || "Page not found"}</h1>
      <p>This page or event is not available.</p>
      <a href="/bookings">Explore events</a>
    </main>
  );
}
