const i18next = {
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockResolvedValue(undefined),
    t: (key: string) => key, // Mock translation function
  };
  
  export default i18next;