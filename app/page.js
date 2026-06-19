"use client"
import DotField from './components/DotField'
import AnimatedList from './components/AnimatedList'
import ContactForm from './components/ContactForm'

export default function Home() {
  const items = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
  
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* Интерактивный фон */}
      <DotField
        dotRadius={1.5}
        dotSpacing={14}
        bulgeStrength={67}
        glowRadius={160}
        sparkle={false}
        waveAmplitude={0}
        cursorRadius={500}
        cursorForce={0.1}
        bulgeOnly
        gradientFrom="#A855F7"
        gradientTo="#B497CF"
        glowColor="#120F17"
      />

      {/* Контент */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          zIndex: 10,
          width: '90%',
          maxWidth: '1200px',
        }}
      >
        {/* Надпись */}
        <div
          style={{
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          Булочки с корицей
        </div>

        {/* Контейнер для списка и формы */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '40px',
            width: '100%',
          }}
        >
          {/* Список */}
          <div style={{ minWidth: '300px', flex: '1' }}>
            <AnimatedList
              items={items}
              onItemSelect={(item, index) => console.log(item, index)}
              showGradients
              enableArrowNavigation
              displayScrollbar
            />
          </div>

          {/* Форма */}
          <div style={{ minWidth: '300px', flex: '1' }}>
            <ContactForm />
          </div>
        </div>
      </div>

    </div>
  )
}