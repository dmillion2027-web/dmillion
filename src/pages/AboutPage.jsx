import { motion } from 'framer-motion';
import { About } from '../components/sections/About';
import { Award, Users, Globe, Sparkles } from 'lucide-react';

export function AboutPage() {
  const timeline = [
    { title: 'Our Foundation', description: 'DMILLION was born from a passion for exceptional craftsmanship and timeless design. We create luxury bags that transcend trends.' },
    { title: 'Global Recognition', description: 'Our collections have earned acclaim from fashion enthusiasts and critics worldwide for their innovative design and uncompromising quality.' },
    { title: 'Sustainable Luxury', description: 'We champion eco-conscious manufacturing, using ethically sourced materials without compromising on elegance or durability.' },
    { title: 'Digital Excellence', description: 'Today, we blend heritage craftsmanship with cutting-edge technology to bring our luxury collections to customers globally.' },
  ];

  const achievements = [
    { icon: Award, value: '50+', label: 'Design Awards' },
    { icon: Users, value: '100K+', label: 'Loyal Customers' },
    { icon: Globe, value: '45', label: 'Countries Served' },
    { icon: Sparkles, value: '15+', label: 'Years of Excellence' },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-20 sm:py-28 md:py-32 bg-gradient-to-br from-[#e8d5b7]/20 via-stone-100 to-white overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white text-[10px] sm:text-xs tracking-widest rounded-full mb-4 sm:mb-6">
              ABOUT DMILLION
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif mb-4 sm:mb-6 px-4">
              Crafting Excellence Since 2010
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed px-4">
              We believe that a bag is more than an accessory—it's a statement of who you are. 
              Every DMILLION piece embodies our commitment to quality, elegance, and timeless design.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <About />

      {/* Timeline Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-serif mb-3 sm:mb-4">Our Journey</h2>
            <p className="text-sm sm:text-base text-gray-600">Milestones that shaped our story</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative pl-6 sm:pl-8 pb-10 sm:pb-12 border-l-2 border-[#e8d5b7] last:pb-0"
              >
                <div className="absolute left-0 top-0 w-3 h-3 sm:w-4 sm:h-4 bg-[#e8d5b7] rounded-full -translate-x-[6.5px] sm:-translate-x-[9px]"></div>
                <div className="bg-gradient-to-br from-stone-50 to-[#e8d5b7]/20 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-[#e8d5b7] rounded-full flex items-center justify-center">
                  <achievement.icon className="w-10 h-10 text-black" />
                </div>
                <div className="text-4xl font-serif mb-2">{achievement.value}</div>
                <div className="text-gray-600">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
