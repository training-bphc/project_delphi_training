type GoogleLoginButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

function GoogleLoginButton({
  onClick,
  disabled = false,
}: GoogleLoginButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} style={buttonStyle}>
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt=""
        style={iconStyle}
      />
      <span> Login with Google </span>
    </button>
  );
}

const buttonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 16px",
  borderRadius: "4px",
  border: "1px solid #dadce0",
  backgroundColor: "#fff",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
};

const iconStyle = {
  width: "18px",
  height: "18px",
};

export default GoogleLoginButton;
