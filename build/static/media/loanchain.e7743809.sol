pragma solidity ^0.4.22;


contract Applicant {

    struct  ApplicantAddress {
        string  street1;
        string  street2;
        string  city;
        string  zip;
        string  state;
        string  country;
    }

    struct Application {
        string lenderName;
        address lenderAddress;
        bool active;
        uint appliedDate;
    }

    string private applicantName;
    string private applicantSex;
    string  private applicantDOB;
    ApplicantAddress private homeAdd;
    int private ssn;
    int private applicantIncome;
    address private signedBy;
    mapping (address => Application) public applicationDetails;
    event ApplicationAcknowledged(address from);
    event PersonalInfoRead(address from);
    address[] public myApplications;

    modifier lenderCallOnly() {
        if (!applicationDetails[msg.sender].active) {
            revert();
        } else {
            _;
        }
    }

    function Applicant(string _applicantName,
                        string _applicantSex,
                        string _applicantDOB,
                        string _street1,
                        string _street2,
                        string _city,
                        string _zip,
                        string _state,
                        string _country,
                        int _ssn,
                        int _applicantIncome) public {

        applicantName = _applicantName;
        applicantSex = _applicantSex;
        applicantDOB = _applicantDOB;
        homeAdd = ApplicantAddress(_street1, _street2, _city, _zip, _state, _country);
        ssn = _ssn;
        applicantIncome = _applicantIncome;
        signedBy = msg.sender;
    }

    function findBySSN(int _ssn) public view returns (bool) {
        if (ssn == _ssn) {
            return true;
        }
        return false;
    }

    function ackApplication(string _name, address _lenderAddress) public {

        applicationDetails[msg.sender] = Application(_name, _lenderAddress, true, now);
        ApplicationAcknowledged(msg.sender);
        myApplications.push(msg.sender);
    }

       //add modified lenderCallOnly to restrict access ONLY to lender
    function getApplicantDetails() public view  returns(string, string, string, int, int, address) {
        return (applicantName, applicantSex, applicantDOB, ssn, applicantIncome, signedBy);
    }

       //add modified lenderCallOnly to restrict access ONLY to lender
    function getApplicantAddress() public  view  returns(string, string, string, string, string, string) {
        return(homeAdd.street1, homeAdd.street2, homeAdd.city, homeAdd.zip, homeAdd.state, homeAdd.country);
    }
}


contract LoanProgram {

    event ApplicationCreated(address contractAddress);
    string public name;

    function LoanProgram(string _name) public {

        name = _name;
    }

    function apply(address _applicant, string _loanType, int _loanAmount, int _loanPeriodInYears) public {

        address newContract = new Loan(name, _applicant, _loanType, _loanAmount, _loanPeriodInYears);
        ApplicationCreated(newContract);
    }
}


contract Loan {

    address public applicantContractAddress;
    string public loanType;
    int public loanAmount;
    address public loanProgramAddress = msg.sender;
    bool public received;
    bool public goodCredit;
    bool public approved;
    event UpdatingCreditStatusFor(int ssn);
    event DisclosuresUpdated(int estimatedIntrestRate, int estimatedEMI);
    event LoanAmountTxfed(uint amount);
    int private ssn;
    int private applicantIncome;
    address private signedBy;
    int public estimatedIntrestRate;
    int public estimatedEMI;
    int public loanPeriodInYears;

    function Loan(string _name, address _applicantContract, string _type, int _amount, int _periodInYears) public {
        Applicant applicant =  Applicant(_applicantContract);
        applicant.ackApplication(_name, loanProgramAddress);
        (, , , ssn, applicantIncome, signedBy) = applicant.getApplicantDetails();
        applicantContractAddress = _applicantContract;
        loanType = _type;
        loanAmount = _amount;
        received = true;
        loanPeriodInYears = _periodInYears;
    }

    function updateCreditStatus(bool _creditStatus) public {
        UpdatingCreditStatusFor(ssn);
        goodCredit = _creditStatus;
    }

    function addDisclosure(int _estimatedIntrestRate, int _estimatedEMI) public {
        estimatedIntrestRate = _estimatedIntrestRate;
        estimatedEMI = _estimatedEMI;
        DisclosuresUpdated(_estimatedIntrestRate, _estimatedEMI);

    }

    function approveLoan() public payable {
        if (goodCredit) {
            signedBy.transfer(msg.value);
            approved = true;
            LoanAmountTxfed(msg.value);
        } else {
            revert();
        }
    }
}
