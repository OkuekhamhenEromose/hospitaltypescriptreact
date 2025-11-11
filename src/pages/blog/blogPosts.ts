import type { BlogPost } from './types';

export const blogPosts: BlogPost[] = [
  {
    id: 'understanding-autism',
    title: 'Understanding Autism: Embracing Neurodiversity in Our Community',
    excerpt: 'April is Autism Awareness Month, a time dedicated to increasing understanding autism and acceptance of people with Autism Spectrum Disorder (ASD). We believe in the power of awareness and education to create a more inclusive society. Here, we share essential insights about autism and how we can support individuals on the spectrum.',
    category: 'General health',
    author: 'Etta-Atlantic',
    date: 'April 12, 2025',
    imageUrl: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    content: {
      introduction: 'April is Autism Awareness Month, a time dedicated to increasing understanding autism and acceptance of people with Autism Spectrum Disorder (ASD). We believe in the power of awareness and education to create a more inclusive society. Here, we share essential insights about autism and how we can support individuals on the spectrum.',
      sections: [
        {
          title: 'What is Autism?',
          content: 'Autism Spectrum Disorder (ASD) is a developmental condition characterized by differences in communication, behavior, and social interaction. The term "spectrum" reflects the wide variation in challenges and strengths possessed by each person with autism. Some individuals may require significant support in their daily lives, while others may live independently and excel in various fields.',
        },
        {
          title: 'Recognizing the Signs',
          content: 'Early diagnosis and intervention can make a significant difference in the lives of individuals with autism.',
          subsections: [
            {
              title: 'Common signs to look out for include',
              content: '',
              items: [
                'Difficulty with social interactions, such as avoiding eye contact or struggling to understand social cues.',
                'Repetitive behaviors or intense interest in specific topics.',
                'Sensitivity to sensory inputs like lights, sounds, or textures.',
                'Challenges with communication, which may range from delayed speech to difficulty in holding conversations.',
              ],
            },
          ],
        },
        {
          title: 'Supporting Individuals with Autism',
          content: 'Creating an inclusive environment benefits everyone. Here are some ways we can support individuals with autism:',
          subsections: [
            {
              title: 'Here are some ways we can support individuals with autism',
              content: '',
              items: [
                'Educate Yourself and Others: Understanding autism helps reduce stigma and promotes acceptance.',
                'Practice Patience and Empathy: Recognize that each individual is unique and may communicate or interact differently.',
                'Provide Clear Communication: Use straightforward language and give individuals time to process information.',
                'Support Sensory Needs: Be mindful of sensory sensitivities by minimizing overwhelming stimuli when possible.',
                'Advocate for Inclusion: Encourage schools, workplaces, and communities to adopt inclusive practices.',
              ],
            },
          ],
        },
        {
          title: 'Conclusion',
          content: 'At Etta-Atlantic Memorial Hospital and Diagnostic Centre, we are committed to providing compassionate care and support for individuals with autism and their families. This Autism Awareness Month, let us all take steps toward greater understanding, acceptance, and inclusion. Together, we can build a community where everyone is valued and empowered to reach their full potential.',
        },
      ],
    },
  },
  {
    id: 'healthy-eating-habits',
    title: '10 Healthy Eating Habits to Transform Your Life',
    excerpt: 'Discover essential healthy eating habits that can improve your overall wellbeing. From portion control to mindful eating, learn practical tips for a healthier lifestyle.',
    category: 'Nutrition',
    author: 'Etta-Atlantic',
    date: 'March 28, 2025',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    content: {
      introduction: 'Good nutrition is the foundation of a healthy life. Making small, sustainable changes to your eating habits can have a profound impact on your physical and mental wellbeing. Here are ten practical habits to help you transform your relationship with food.',
      sections: [
        {
          title: 'Start Your Day Right',
          content: 'A nutritious breakfast kickstarts your metabolism and provides energy for the day ahead. Choose whole grains, lean proteins, and fresh fruits to fuel your morning.',
        },
        {
          title: 'Practice Portion Control',
          content: 'Understanding appropriate portion sizes helps prevent overeating. Use smaller plates, measure servings, and listen to your body\'s hunger cues.',
        },
        {
          title: 'Stay Hydrated',
          content: 'Water is essential for every bodily function. Aim for 8-10 glasses daily and increase intake during exercise or hot weather.',
        },
      ],
    },
  },
  {
    id: 'exercise-mental-health',
    title: 'The Connection Between Exercise and Mental Health',
    excerpt: 'Explore how regular physical activity can boost your mental wellbeing, reduce stress, and improve mood through scientific evidence and practical advice.',
    category: 'Mental Health',
    author: 'Etta-Atlantic',
    date: 'March 15, 2025',
    imageUrl: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    content: {
      introduction: 'The link between physical exercise and mental health is well-established. Regular physical activity can significantly improve mood, reduce anxiety, and enhance overall mental wellbeing.',
      sections: [
        {
          title: 'How Exercise Affects the Brain',
          content: 'Physical activity triggers the release of endorphins, often called "feel-good" hormones. These natural mood elevators can help reduce stress and anxiety while promoting a sense of wellbeing.',
        },
        {
          title: 'Finding the Right Exercise',
          content: 'The best exercise is one you enjoy and can maintain consistently. Whether it\'s walking, swimming, dancing, or yoga, find activities that bring you joy.',
        },
      ],
    },
  },
];
