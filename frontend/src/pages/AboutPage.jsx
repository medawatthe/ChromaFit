import PublicLayout from '../components/PublicLayout';

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-white">About ChromaFit</h1>
          <p className="mt-4 text-blue-100">
            The average person spends 15–20 minutes every day deciding what to wear — time lost to
            cognitive overload, poor wardrobe visibility, and a lack of accessible styling tools.
            ChromaFit was built to fix that: an AI-powered personal fashion recommendation and
            wardrobe analytics platform that turns the clothes you already own into data-driven
            styling advice.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">What it does</h2>
              <p className="mt-2 text-gray-600">
                Upload photos of your clothing and ChromaFit builds a searchable digital wardrobe.
                From there, AI analyzes each item for color harmony, skin-tone compatibility, and
                occasion suitability, and gives you a quantitative fashion score. An AI stylist
                chatbot answers wardrobe questions in real time, and a sustainability score tracks
                how much of your closet you actually use — encouraging rewearing over rebuying.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">How it's built</h2>
              <p className="mt-2 text-gray-600">
                ChromaFit runs on a React + Tailwind CSS frontend, a Node.js/Express REST API, and a
                PostgreSQL database, with AI vision and conversation handled through a large language
                model API. It's designed as a full-stack, real-world demonstration of integrating
                multimodal AI into an everyday productivity tool.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">Why it exists</h2>
              <p className="mt-2 text-gray-600">
                Most existing fashion apps are either paywalled, region-restricted, or built purely
                to drive sales rather than genuinely help people use what they already own.
                ChromaFit is a utility-first alternative — expert-level styling intelligence,
                accessible to anyone with a web browser, regardless of budget or location.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-lg font-semibold text-gray-900">The project</h2>
              <p className="mt-2 text-sm text-gray-500">
                ChromaFit is a Final Year Project for the BSc (Hons) Software Engineering degree at
                Cardiff Metropolitan University, built and designed by Irushi Nawodya Medawaththa.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
