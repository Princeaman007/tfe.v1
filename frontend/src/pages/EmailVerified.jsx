import { useSearchParams } from "react-router-dom";

const EmailVerified = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get("status");

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Vérification de l'email</h2>
            {status === "success" && <p>✅ Email vérifié avec succès ! Vous pouvez maintenant vous connecter.</p>}
            {status === "already-verified" && <p>⚠️ Votre email est déjà vérifié.</p>}
            {status === "error" && <p>❌ Une erreur est survenue. Essayez à nouveau.</p>}
            <a href="/login">Se connecter</a>
        </div>
    );
};

export default EmailVerified;
