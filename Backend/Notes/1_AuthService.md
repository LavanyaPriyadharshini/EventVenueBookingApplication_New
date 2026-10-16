  //here the "next" passes the control to the next middleware or forwards an error
export const register = asyncHandler(async (req, res, next) => {
 
 //validate the incoming data
 //it refers to the schema
  const parsed = registerSchema.safeParse(req.body);

//this line handles invalid input
  if (!parsed.success) return next(new AppError(parsed.error.issues[0].message, 400));

//extract the validated values
  const { email, password, firstName, lastName, mobileNumber } = parsed.data;
  if (await User.exists({ email })) return next(new AppError('Email already registered', 409));

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, firstName, lastName, mobileNumber });

  res.status(201).json({
    status: 'success',
    data: { id: user._id, email: user.email, firstName, lastName },
    token: signToken(user.id, user.role),
  });
});
