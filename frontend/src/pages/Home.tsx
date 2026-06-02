import React from "react";
import {
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <BrainCircuit size={28} />,
    title: "Smart Conversations",
    desc: "Experience fluid AI interactions with memory, context awareness, and human-like responses.",
  },
  {
    icon: <Zap size={28} />,
    title: "Lightning Fast",
    desc: "Optimized responses powered by modern AI infrastructure for seamless chatting.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Secure & Private",
    desc: "Your conversations stay protected with secure authentication and encrypted sessions.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
      </div>

      {/* Navbar */}
      <nav className="w-full px-6 md:px-16 py-5 flex items-center justify-between backdrop-blur-md">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-wide flex items-center gap-2"
        >
          <Sparkles className="text-cyan-400" />
          NovaAI
        </motion.h1>

        <div className="flex gap-4">
          <button className="px-5 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition">
            Login
          </button>

          <button className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition text-black font-semibold shadow-lg shadow-cyan-500/30">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-16 pt-16 md:pt-28 pb-24 flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm mb-6">
            <Sparkles className="text-cyan-400" size={16} />
            Personalized AI Assistant
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            Your AI Universe,
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
              {" "}
              Reimagined
            </span>
          </h1>

          <p className="mt-6 text-gray-300 text-lg leading-relaxed">
            Build ideas, ask questions, generate code, and create with an
            intelligent assistant designed to feel futuristic and personal.
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            <button className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition text-black font-bold shadow-xl shadow-cyan-500/30">
              Start Chatting
            </button>

            <button className="px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/10 transition">
              Explore Features
            </button>
          </div>
        </motion.div>

        {/* Right Animated Card */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
            }}
            className="w-[320px] md:w-[420px] bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-xl">NovaAI Assistant</h2>
                <p className="text-sm text-gray-400">Online</p>
              </div>

              <div className="w-3 h-3 bg-green-400 rounded-full animate-ping" />
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl">
                How can I help you today?
              </div>

              <div className="bg-cyan-500 text-black p-4 rounded-2xl ml-10">
                Build me a futuristic AI dashboard 🚀
              </div>

              <div className="bg-white/10 p-4 rounded-2xl">
                Generating components, animations, and responsive layouts...
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-16 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Why Choose NovaAI?
          </h2>

          <p className="text-gray-400 mt-4 text-lg">
            Designed to feel elegant, intelligent, and alive.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{
                scale: 1.05,
                rotate: 1,
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md hover:border-cyan-400/40 transition"
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-semibold mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-16 py-20">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10 rounded-[40px] p-10 md:p-16 text-center backdrop-blur-xl"
        >
          <h2 className="text-4xl md:text-6xl font-black leading-tight">
            Ready to build the future?
          </h2>

          <p className="text-gray-300 mt-6 text-lg max-w-2xl mx-auto">
            Your personalized AI companion is waiting inside the command
            center.
          </p>

          <button className="mt-10 px-10 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition text-black font-bold shadow-xl shadow-cyan-500/30">
            Launch App
          </button>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;