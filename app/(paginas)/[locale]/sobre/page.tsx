'use client';

import { ReactNode } from 'react';
import {
  FaCode,
  FaLightbulb,
  FaStar,
  FaGithub,
  FaLinkedin,
  FaAccessibleIcon,
  FaShieldAlt,
  FaHeart,
  FaChartLine,
  FaUniversity,
  FaGraduationCap,
} from 'react-icons/fa';
import { BsTranslate, BsLightningCharge, BsPeople, BsShield, BsGlobe2, BsRocket } from 'react-icons/bs';
import { HiSparkles, HiChatBubbleLeftRight, HiGlobeAlt, HiUserGroup, HiCog6Tooth, HiMicrophone } from 'react-icons/hi2';
import { MdComputer } from "react-icons/md";
import Avatar from 'react-avatar';
import { motion, useScroll } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageDetector from '../../../components/functionals/LanguageDetector';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Timeline from '@/app/components/timeline/Timeline';
import { image } from '@heroui/react';

interface CardProps {
  nome: string;
  srcImagem?: string | any;
  altImagem?: string;
  cargo: string;
  tags: string[];
  icon?: ReactNode[];
  linkGithub?: string;
  linkLinkedin?: string;
  description?: string;
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

export default function SobrePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'pt-BR';
  const t = useTranslation('', { keyPrefix: 'sobre' }).t;
  const timelineItems = [
    {
      date: t('evolucao.timeline.janeiro_2024.data'),
      title: t('evolucao.timeline.janeiro_2024.titulo'),
      description: t('evolucao.timeline.janeiro_2024.descricao'),
      icon: <FaLightbulb size={20} />,
      color: '#38A3F5',
    },
    {
      date: t('evolucao.timeline.marco_2024.data'),
      title: t('evolucao.timeline.marco_2024.titulo'),
      description: t('evolucao.timeline.marco_2024.descricao'),
      icon: <HiGlobeAlt size={20} />,
      color: '#786FF2',
    },
    {
      date: t('evolucao.timeline.maio_2024.data'),
      title: t('evolucao.timeline.maio_2024.titulo'),
      description: t('evolucao.timeline.maio_2024.descricao'),
      icon: <FaCode size={20} />,
      color: '#6F90F2',
      image: '/images/pictures/scientif.png',
      imageAlt: 'Desenvolvimento inicial - primeiras linhas de código',
    },
    {
      date: t('evolucao.timeline.julho_2024.data'),
      title: t('evolucao.timeline.julho_2024.titulo'),
      description: t('evolucao.timeline.julho_2024.descricao'),
      icon: <FaAccessibleIcon size={20} />,
      color: '#6FE3F2',
      image: '/images/pictures/Iftech.png',
      imageAlt: 'Funcionalidades de acessibilidade - design inclusivo',
    },
    {
      date: t('evolucao.timeline.setembro_2024.data'),
      title: t('evolucao.timeline.setembro_2024.titulo'),
      description: t('evolucao.timeline.setembro_2024.descricao'),
      icon: <HiUserGroup size={20} />,
      color: '#A46FF2',
      image: '/images/pictures/bancafinal.png',
      imageAlt: 'Fase de testes - feedback dos usuários',
    },
    {
      date: t('evolucao.timeline.outubro_2024.data'),
      title: t('evolucao.timeline.outubro_2024.titulo'),
      description: t('evolucao.timeline.outubro_2024.descricao'),
      icon: <HiCog6Tooth size={20} />,
      color: '#BFCCF2',
    },
    {
      date: t('evolucao.timeline.novembro_2024.data'),
      title: t('evolucao.timeline.novembro_2024.titulo'),
      description: t('evolucao.timeline.novembro_2024.descricao'),
      icon: <FaShieldAlt size={20} />,
      color: '#38A3F5',
      image: '/images/pictures/vedang.jpg',
      imageAlt: 'Otimizações e segurança - proteção avançada',
    },
    {
      date: t('evolucao.timeline.dezembro_2024.data'),
      title: t('evolucao.timeline.dezembro_2024.titulo'),
      description: t('evolucao.timeline.dezembro_2024.descricao'),
      icon: <MdComputer size={20} />,
      color: '#786FF2',
      image: '/images/pictures/febicvirtual.png',
      imageAlt: 'Classificação e apresentação na etapa virtual da FEBIC',
    },
    // NOVOS EVENTOS
    {
      date: t('evolucao.timeline.setembro_2025.data'),
      title: t('evolucao.timeline.setembro_2025.titulo'),
      description: t('evolucao.timeline.setembro_2025.descricao'),
      icon: <FaGraduationCap size={20} />,
      color: '#6FE3F2',
    },
    {
      date: t('evolucao.timeline.outubro_2025.data'),
      title: t('evolucao.timeline.outubro_2025.titulo'),
      description: t('evolucao.timeline.outubro_2025.descricao'),
      icon: <BsPeople size={20} />,
      color: '#A46FF2',
    },
    {
      date: t('evolucao.timeline.novembro_2025.data'),
      title: t('evolucao.timeline.novembro_2025.titulo'),
      description: t('evolucao.timeline.novembro_2025.descricao'),
      icon: <HiSparkles size={20} />,
      color: '#38A3F5',
    },
    {
      date: t('evolucao.timeline.dezembro_2025.data'),
      title: t('evolucao.timeline.dezembro_2025.titulo'),
      description: t('evolucao.timeline.dezembro_2025.descricao'),
      icon: <BsRocket size={20} />,
      color: '#6F90F2',
    },
  ];
  const features = [
    {
      icon: <BsTranslate />,
      title: t('recursos.traducao_tempo_real.titulo'),
      description: t('recursos.traducao_tempo_real.descricao'),
      color: '#38A3F5',
    },
    {
      icon: <HiMicrophone />,
      title: t('recursos.sintese_voz.titulo'),
      description: t('recursos.sintese_voz.descricao'),
      color: '#786FF2',
    },
    {
      icon: <FaAccessibleIcon />,
      title: t('recursos.acessibilidade_total.titulo'),
      description: t('recursos.acessibilidade_total.descricao'),
      color: '#6FE3F2',
    },
    {
      icon: <BsLightningCharge />,
      title: t('recursos.velocidade_extrema.titulo'),
      description: t('recursos.velocidade_extrema.descricao'),
      color: '#6F90F2',
    },
    {
      icon: <BsShield />,
      title: t('recursos.seguranca_avancada.titulo'),
      description: t('recursos.seguranca_avancada.descricao'),
      color: '#A46FF2',
    },
    {
      icon: <HiCog6Tooth />,
      title: t('recursos.personalizacao_total.titulo'),
      description: t('recursos.personalizacao_total.descricao'),
      color: '#BFCCF2',
    },
  ];
  const teamMembers = [
    {
      nome: t('equipe.membros.christopher.nome'),
      srcImagem: '/images/pictures/imagemChristopher.png',
      altImagem: 'Foto do Christopher',
      cargo: t('equipe.membros.christopher.cargo'),
      description: t('equipe.membros.christopher.descricao'),
      tags: [],
      icon: [<FaGithub key="github" />, <FaLinkedin key="linkedin" />],
      linkGithub: 'https://github.com/christophergouveia',
      linkLinkedin: 'https://linkedin.com/in/christopher-oliveira',
    },
    {
      nome: t('equipe.membros.gustavo.nome'),
      srcImagem: '/images/pictures/imagemGustavo.png',
      altImagem: 'Foto do Gustavo',
      cargo: t('equipe.membros.gustavo.cargo'),
      description: t('equipe.membros.gustavo.descricao'),
      tags: [],
      icon: [<FaGithub key="github" />, <FaLinkedin key="linkedin" />],
      linkGithub: 'https://github.com/GustavoGPreti',
      linkLinkedin: 'https://linkedin.com/in/gustavo-preti',
    },
    {
      nome: t('equipe.membros.kaike.nome'),
      srcImagem: '/images/pictures/imagemKaike.png',
      altImagem: 'Foto do Kaike',
      cargo: t('equipe.membros.kaike.cargo'),
      description: t('equipe.membros.kaike.descricao'),
      tags: [],
      icon: [<FaGithub key="github" />, <FaLinkedin key="linkedin" />],
      linkGithub: 'https://github.com/KaikeSathler',
      linkLinkedin: 'https://linkedin.com/in/kaike-sathler',
    },
    {
      nome: t('equipe.membros.michelli.nome'),
      srcImagem: null,
      altImagem: 'Avatar da Professora Michelli',
      cargo: t('equipe.membros.michelli.cargo'),
      description: t('equipe.membros.michelli.descricao'),
      tags: [],
      icon: [<FaUniversity key="university" />, <FaGraduationCap key="graduation" />],
      linkGithub: '#',
      linkLinkedin: '#',
    },
  ];
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 sobre-page" data-page="sobre">
      <LanguageDetector />
      <section className="relative py-24 bg-gradient-to-br from-primary-50 via-secondary-50 to-cyan-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-8 shadow-sm border border-primary-200 dark:border-primary-800"
            >
              <HiGlobeAlt className="w-4 h-4" />
              {t('hero.badge')}
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 text-gray-900 dark:text-white tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('hero.titulo.parte1')}{' '}
              <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-cyan-600 bg-clip-text text-transparent">
                {t('hero.titulo.parte2')}
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10 font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t('hero.descricao')}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {' '}
              <Link
                href={`/${locale}/conversar`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                <HiChatBubbleLeftRight className="w-5 h-5" />
                {t('hero.botoes.comecar_conversar')}
              </Link>
              <Link
                href="#equipe"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                <HiUserGroup className="w-5 h-5" />
                {t('hero.botoes.conhecer_equipe')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>{' '}
      <section className="py-20 bg-gradient-to-br from-primary-50 via-secondary-50 to-cyan-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              {' '}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-6">
                <FaShieldAlt className="w-4 h-4" />
                {t('privacidade.badge')}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                <span className="text-gray-900 dark:text-white">
                  {t('privacidade.titulo.parte1')}{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {t('privacidade.titulo.privacidade_palavra')}
                  </span>
                  ,
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  {t('privacidade.titulo.parte2')}{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {t('privacidade.titulo.responsabilidade_palavra')}
                  </span>
                  .
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                {t('privacidade.descricao')}
              </p>
              <div className="space-y-4">
                {[
                  { icon: '🔐', text: t('privacidade.recursos.criptografia') },
                  { icon: '🚫', text: t('privacidade.recursos.dados_nao_armazenados') },
                  { icon: '⚖️', text: t('privacidade.recursos.conformidade_lgpd') },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>{' '}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative">
                <Image
                  src="/images/pictures/Conversation-s.png"
                  alt={t('privacidade.imagem_alt')}
                  width={500}
                  height={400}
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('diferenciais.titulo')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('diferenciais.subtitulo')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="group relative rounded-2xl bg-gradient-to-br from-red-50 via-pink-50 to-red-50 dark:from-red-900/20 dark:via-pink-900/20 dark:to-red-900/20 p-8 hover:shadow-2xl transition-all duration-500 border border-red-100 dark:border-red-800/30 hover:border-red-200 dark:hover:border-red-700/50 transform hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full -m-6 group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FaShieldAlt className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {t('diferenciais.seguranca.titulo')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {t('diferenciais.seguranca.descricao')}
                </p>{' '}
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src="/images/pictures/security.png"
                    alt={t('diferenciais.seguranca.imagem_alt')}
                    width={200}
                    height={120}
                    className="w-full h-24 object-contain opacity-80 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 p-8 hover:shadow-2xl transition-all duration-500 border border-blue-100 dark:border-blue-800/30 hover:border-blue-200 dark:hover:border-blue-700/50 transform hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full -m-6 group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FaHeart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                  {t('diferenciais.gratuito.titulo')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {t('diferenciais.gratuito.descricao')}
                </p>{' '}
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src="/images/pictures/Coins-amico.png"
                    alt={t('diferenciais.gratuito.imagem_alt')}
                    width={200}
                    height={120}
                    className="w-full h-24 object-contain opacity-80 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-8 hover:shadow-2xl transition-all duration-500 border border-purple-100 dark:border-purple-800/30 hover:border-purple-200 dark:hover:border-purple-700/50 transform hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full -m-6 group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <HiUserGroup className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">
                  {t('diferenciais.sem_cadastro.titulo')}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {t('diferenciais.sem_cadastro.descricao')}
                </p>

                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <HiChatBubbleLeftRight className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>{' '}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
              <HiSparkles className="w-4 h-4" />
              Recursos Avançados
            </div>{' '}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('recursos.titulo')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('recursos.subtitulo')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: 'easeOut',
                }}
                whileHover={{
                  y: -8,
                  transition: {
                    duration: 0.3,
                  },
                }}
                className="group relative rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 text-white text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    style={{ backgroundColor: feature.color }}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>{' '}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            {' '}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-8">
              <FaChartLine className="w-4 h-4" />
              {t('evolucao.badge')}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('evolucao.titulo')}
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
              {t('evolucao.subtitulo')}
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-pink-100/20 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 rounded-3xl"></div>

            <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-white/20 dark:border-gray-700/20">
              <Timeline events={timelineItems} />
            </div>
          </div>
        </div>
      </section>{' '}
      <section id="equipe" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            {' '}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium mb-6">
              <HiUserGroup className="w-4 h-4" />
              {t('equipe.badge')}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('equipe.titulo')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('equipe.subtitulo')}
            </p>
          </motion.div>{' '}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: 'easeOut',
                }}
                whileHover={{
                  y: -10,
                  transition: {
                    duration: 0.3,
                  },
                }}
                className="group relative rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="relative flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                      {member.srcImagem ? (
                        <div className="relative">
                          <Image
                            src={member.srcImagem}
                            width={80}
                            height={80}
                            alt={member.altImagem ?? 'Imagem'}
                            className="rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
                        </div>
                      ) : (
                        <Avatar
                          className="border-4 border-white dark:border-gray-700 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          name={member.nome}
                          maxInitials={2}
                          size="80"
                          round
                        />
                      )}

                      <div className="absolute -bottom-2 -right-2 flex space-x-1">
                        {member.icon?.map((value, iconIndex) => (
                          <div
                            key={iconIndex}
                            className="bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 border border-gray-200 dark:border-gray-600 group-hover:scale-110 transition-transform duration-300"
                          >
                            <Link
                              href={iconIndex === 0 ? (member.linkGithub ?? '#') : member.linkLinkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                            >
                              {value}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {member.nome}
                    </h3>

                    <p className="text-blue-600 dark:text-blue-400 font-semibold text-center mb-4">{member.cargo}</p>

                    {member.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed mb-6">
                        {member.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    {member.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>{' '}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm font-medium mb-6">
                <FaHeart className="w-4 h-4" />
                Nossa Missão
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-white">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t('missao.titulo')}
                </span>
              </h2>

              <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {t('missao.texto.quebrar_barreiras')}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {t('missao.texto.tecnologia_humanidade')}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {t('missao.texto.acessibilidade_total')}
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -m-8"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -m-4"></div>

                <div className="relative z-10">
                  <FaHeart className="w-12 h-12 mb-6 text-white/90" />

                  <h3 className="text-2xl font-bold mb-6">{t('missao.valores.titulo')}</h3>

                  <div className="space-y-4">
                    {[
                      { icon: '🤝', text: t('missao.valores.inclusividade') },
                      { icon: '🚀', text: t('missao.valores.inovacao') },
                      { icon: '🔒', text: t('missao.valores.privacidade') },
                      { icon: '✨', text: t('missao.valores.experiencia') },
                    ].map((value, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center gap-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm"
                      >
                        <span className="text-2xl">{value.icon}</span>
                        <span className="font-medium">{value.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="min-h-screen bg-gradient-to-br from-primary-600 via-secondary-600 to-cyan-600 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/15 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30"
            >
              <HiGlobeAlt className="w-5 h-5" />
              Pronto para começar?
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight"
            >
              {t('cta.titulo')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto"
            >
              {t('cta.descricao')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link
                href={`/${locale}/conversar`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/20 font-semibold text-lg min-w-[200px]"
              >
                <HiChatBubbleLeftRight className="w-6 h-6" />
                {t('cta.botoes.comecar_agora')}
              </Link>

              <Link
                href={`/${locale}/configuracoes`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-transparent text-white rounded-xl border-2 border-white hover:bg-white hover:text-primary-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/20 font-semibold text-lg min-w-[200px]"
              >
                <HiCog6Tooth className="w-6 h-6" />
                {t('cta.botoes.personalizar')}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FaAccessibleIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">100% Acessível</h3>
                <p className="text-white/80 text-sm">Para todos os tipos de deficiência</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FaHeart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Totalmente Gratuito</h3>
                <p className="text-white/80 text-sm">Sem taxas ou assinaturas</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FaShieldAlt className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Privacidade Total</h3>
                <p className="text-white/80 text-sm">Sem cadastro ou dados pessoais</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
