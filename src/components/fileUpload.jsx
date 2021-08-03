const FileUpload = ({ onChange, ...rest }) => {
  return (
    <div>
      <input
        className="form-control mt-5"
        type="file"
        id="formFile"
        onChange={(e) => {
          onChange(e.target.files[0]);
        }}
        {...rest}
      />
    </div>
  );
};

export default FileUpload;
