// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "Papers and talks, newest first.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "Research and course projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "The PDF download is the icon at the top right.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-teaching",
          title: "teaching",
          description: "Courses I have taught or assisted.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/teaching/";
          },
        },{id: "dropdown-blog",
              title: "blog",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/blog/";
              },
            },{id: "dropdown-research-notes",
              title: "research notes",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/notes/";
              },
            },{id: "dropdown-study-materials",
              title: "study materials",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/study/";
              },
            },{id: "dropdown-bookshelf",
              title: "bookshelf",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/books/";
              },
            },{id: "dropdown-infographics",
              title: "infographics",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/infographics/";
              },
            },{id: "dropdown-playgrounds",
              title: "playgrounds",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/playgrounds/";
              },
            },{id: "post-rag-without-vectors-why-pageindex-might-be-the-architecture-we-ve-been-missing",
        
          title: 'RAG Without Vectors? Why PageIndex Might be the Architecture We’ve Been Missing <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "In recent times, Large Language Models (LLMs) have become the go-to solution for answering user queries. However, the context window (the maximum amount of tokenized text a model can process at one time) has remained a fundamental architectural limit. While recent models support longer contexts, researchers have established that model performance deteriorates with growing context length.¹ This creates problems for LLMs to accurately interpret and reason over long, complex, domain-specific documents.",
        section: "Posts",
        handler: () => {
          
            window.open("https://pub.towardsai.net/rag-without-vectors-why-pageindex-might-be-the-architecture-weve-been-missing-4563adf8fe09", "_blank");
          
        },
      },{id: "post-to-relu-or-not-to-relu-a-practitioner-s-guide-to-solve-the-zombie-neuron-problem-in-deep-networks",
        
          title: 'To ReLU, or not to ReLU: A Practitioner’s Guide to Solve the “Zombie... <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "In our brains, neurons constantly filter huge amounts of sensory data, recognizing patterns and ignoring unnecessary information. This is exactly what artificial neural networks do, and it is accomplished through activation functions.",
        section: "Posts",
        handler: () => {
          
            window.open("https://pub.towardsai.net/to-relu-or-not-to-relu-a-practitioners-guide-to-solve-the-zombie-neuron-problem-in-deep-89a050a6b25b", "_blank");
          
        },
      },{id: "post-getting-active-the-math-that-makes-neural-networks-learn",
        
          title: 'Getting Active: The Math That Makes Neural Networks Learn <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "In today’s world, “Neural network” must be the most commonly heard term on a daily basis. Neural networks are computational models inspired by the human brain, designed to recognize complex patterns and make decisions based on data (predicting outcomes or classify data etc.). They consist of layers of interconnected nodes (neurons) that process and transmit information. One of the key components that enable neural networks to learn and perform complex tasks is the activation function.",
        section: "Posts",
        handler: () => {
          
            window.open("https://medium.com/@basak.suvinava2008/getting-active-the-math-that-makes-neural-networks-learn-e500d6d71568", "_blank");
          
        },
      },{id: "books-another-placeholder-book-title",
          title: 'Another placeholder book title',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/placeholder-book-2/";
            },},{id: "books-placeholder-book-title",
          title: 'Placeholder book title',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/placeholder-book-1/";
            },},{id: "news-joined-medizinische-hochschule-hannover-as-a-student-research-assistant-working-on-multi-agent-rag-for-scientific-hypothesis-generation",
          title: 'Joined Medizinische Hochschule Hannover as a student research assistant, working on multi-agent RAG...',
          description: "",
          section: "News",},{id: "news-started-my-m-sc-thesis-end-to-end-calibration-of-neural-networks-in-a-biomedical-context-at-tu-braunschweig",
          title: 'Started my M.Sc. thesis, End-to-end calibration of neural networks in a biomedical context,...',
          description: "",
          section: "News",},{id: "news-oral-presentation-at-skill-2026-informatik-2026-dresden-is-grokking-a-loss-of-normal-hyperbolicity-of-the-interpolation-manifold",
          title: 'Oral presentation at SKILL 2026 (INFORMATIK 2026), Dresden: Is grokking a loss of...',
          description: "",
          section: "News",},{id: "news-from-literature-to-hypotheses-an-ai-co-scientist-system-for-biomarker-guided-drug-combination-hypothesis-generation-selected-for-the-demo-track-at-icdm-2026",
          title: 'From literature to hypotheses: An AI co-scientist system for biomarker-guided drug combination hypothesis...',
          description: "",
          section: "News",},{id: "news-submitted-my-m-sc-thesis-end-to-end-calibration-of-neural-networks-in-a-biomedical-context-at-tu-braunschweig",
          title: 'Submitted my M.Sc. thesis, End-to-end calibration of neural networks in a biomedical context,...',
          description: "",
          section: "News",},{id: "projects-end-to-end-calibration-of-neural-networks",
          title: 'End-to-End Calibration of Neural Networks',
          description: "M.Sc. thesis. Theory and empirical evaluation in a biomedical context. TU Braunschweig, supervised by Prof. Dr. Nicole Mücke.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_thesis/";
            },},{id: "projects-uncertainty-quantification-in-neural-networks",
          title: 'Uncertainty Quantification in Neural Networks',
          description: "Neural networks, Gaussian processes and distribution shift. Comparing NNGPs, deep ensembles, MC dropout and RBF GPs.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_uncertainty/";
            },},{id: "projects-covariate-shift-regularization-using-kernel-methods",
          title: 'Covariate Shift Regularization using Kernel Methods',
          description: "How covariate shift affects generalization and reliability. Importance weighting and self-attention-based adaptation.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_covariate_shift/";
            },},{id: "projects-binary-amr-prediction-from-pbp4-using-transformers",
          title: 'Binary AMR Prediction from PBP4 using Transformers',
          description: "Benchmarking DNABERT and Nucleotide Transformer for antimicrobial resistance prediction, with parameter-efficient adaptation.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_amr_transformers/";
            },},{id: "teachings-mathematical-algorithms-and-programming-2",
          title: 'Mathematical Algorithms and Programming 2',
          description: "Led tutorials and graded assignments.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/mathematical-algorithms-and-programming-2/";
            },},{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/assets/pdf/Suvinava_Basak_CV.pdf", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%73%75%76%69%6E%61%76%61.%62%61%73%61%6B@%6F%75%74%6C%6F%6F%6B.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/baksho", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/suvinava-basak", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0009-0005-4289-1205", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=LdhKjt4AAAAJ", "_blank");
        },
      },{
        id: 'social-medium_url',
        title: 'Medium_url',
        section: 'Socials',
        handler: () => {
          window.open("", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
