import styles from '../styles/Layout.module.css';

export default function Layout({ children }) {
  return (
    <div className={styles.container}>
      {/* <header className={styles.header}>
        <h1 className={styles.title}>Upload and Analyze CSV</h1>
      </header> */}
      <main className={styles.main}>
        {children}
      </main>
      {/* <footer className={styles.footer}>
        <p>&copy; 2024 edcults</p>
      </footer> */}
    </div>
  );
}
