import Login from "./login";
export default function AuthPage() {
  return <div className="fixed inset-0 flex items-center justify-center p-4 bg-beauty-neutral">
      <div className="w-full max-w-md mx-auto">
        <Login />
      </div>
    </div>;
}