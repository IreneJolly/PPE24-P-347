import React from 'react';
import '../styles/globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black">
        <header>
          <nav className="">

            {/* Barre de recherche au centre */}
            <div className="">
              <form className="">
                <input
                  type="text"
                  placeholder="Rechercher un cours..."
                  className=""
                />
                <button
                  type="submit"
                  className=""
                >
                  🔍
                </button>
              </form>
            </div>

            {/* Titre du site à droite */}
            <div className="">
              <h1>Self Study</h1>
            </div>

            {/* Informations de l'utilisateur à droite */}
            <div className="">
              <p className="">Utilisateur :</p>
            </div>
          </nav>
        </header>

        {/* Contenu principal */}
        <main>
              {children}
        </main>

        {/* Footer */}
        <footer className="absolute object-bottom">
          <div className="">
            <p className='text-3xl'>© 2025 Self Study. Tous droits réservés.</p>
          </div>
        </footer>
      </body>
    </html>
  );
};