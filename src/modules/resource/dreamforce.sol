//TUESDAY  Mortgage demo using REST calls

pragma solidity ^ 0.4.21;


// Define the interface from the OFS REST DApp
// For this demo we are only use the read function for now
interface sfREST {
//    function write(string key, string value) external;
//function executeFunctions(string functionName, string key, int amount, string _applicantSex, string _applicantDOB, string _street1, string _street2, string _city, string _zip, string _state, string _country, int _ssn, string _applicantIncome) external;
function read(string key) external view returns (string, string, uint, uint, string);

}

//============================================================================
// Modification of LoanProgram to include REST-read function

contract LoanProgram is sfREST {

    event ApplicationCreated(address contractAddress);
    Applicant applicant;
    string public name;
    struct  LOV {
        string  key;
        string  value;
        uint createdDate;
        uint updatedDate;
        string status;
    }
    string public yrdy;

    mapping (string => LOV) private loanAppAddress;

    function LoanProgram() public {

        name = "Add-On Demo Loan Program";
        applicant = new Applicant();
    }

    function apply(address _applicant, string _loanType, int _loanAmount, int _loanPeriodInYears) public {

        address newContract = new Loan(name, _applicant, _loanType, _loanAmount, _loanPeriodInYears);
        emit ApplicationCreated(newContract);
    }

    // This READ function from the REST DApp call will generate an Application and Mortgage Loan
    // The returned Addresses should be used to see the loan in the Mortgage DApp
    function executeFunction(string loanType,string applicantName,int amount,string applicantSex,string applicantDOB,string applicantAdress, int ssn,int annualIncome) public returns(bool success) {
        address newAppl = address(applicant);
        
        applicant.addApplicants(applicantName,applicantSex, applicantDOB,applicantAdress ,ssn, annualIncome);
        
        address newLoan = new Loan("loanName", newAppl, loanType, amount, 25);
        
        loanAppAddress[applicantName] = LOV({
            key: applicantName,
            value: toAsciiString(newLoan),
            createdDate: now,
            updatedDate: now,
            status:"ACTIVE"
        });
    }

    //function executeFunctions(string loanType, string applicantName, int amount, string applicantSex, string applicantDOB, string street1, string street2, string _city, string _zip, string _state, string _country, int _ssn, string _applicantIncome) external {

        //address newAppl = address(applicant);
        //address newAppl = new Applicant(applicantName, _applicantSex, _applicantDOB,_street1,  _street2, _city, _zip, _state, _country,_ssn, _applicantIncome);
     //emit ApplicationCreated(newAppl);
        /*applicant.applicants(applicantName, _applicantSex,  _applicantDOB, _applicantAddress,  "st2", "newmarkt", "2345", "ON", "canda",
                                           777888333,
                                           56000);*/
        //yrdy = applicantName;
        //applicant.setAB(applicantName, applicantSex, applicantDOB, street1);
        //address newLoan = new Loan("loanName", newAppl, loanType, amount, 25);
        

        //name = toAsciiString(newLoan);
		//Now return the two addresses that will be used to access the entry via DApp UI
    /*loanAppAddress[applicantName] = LOV({
        key: applicantName,
        value: toAsciiString(newLoan),
        createdDate: now,
        updatedDate: now,
        status:"ACTIVE"
    });*/
    
    


    //}

    function read(string key) external view returns (string, string, uint, uint, string) {

        LOV storage lov = loanAppAddress[key];
        return (lov.key, lov.value, lov.createdDate, lov.updatedDate, lov.status);
    }


//=========================== Utility Methods ============================================
    function compareStrings (string a, string b) internal pure  returns (bool) {

        return keccak256(a) == keccak256(b);
    }

	function address2String(address x) internal pure returns (string) {
	    bytes memory b = new bytes(20);
	    for (uint i = 0; i < 20; i++)
	        b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    	return "123";   //string(b);
	}

	function toAsciiString(address x) internal pure returns (string) {
	    bytes memory s = new bytes(40);
	    for (uint i = 0; i < 20; i++) {
	        byte b = byte(uint8(uint(x) / (2**(8*(19 - i)))));
	        byte hi = byte(uint8(b) / 16);
	        byte lo = byte(uint8(b) - 16 * uint8(hi));
	        s[2*i] = char(hi);
	        s[2*i+1] = char(lo);
	    }
	    return string(s);
	}

	function char(byte b) internal pure returns (byte) {
    	if (b < 10) return byte(uint8(b) + 0x30);
    	else return byte(uint8(b) + 0x57);
	}

}

//============================================================================
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
    struct  ApplicantFullAddress {
        string fullAdress;
    }
    string private applicantName;
    string private applicantSex;
    string  private applicantDOB;
    ApplicantAddress private homeAdd;
    ApplicantFullAddress private homeFullAdd;
    int private ssn;
    int private applicantIncome;
    address private signedBy = msg.sender;
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
    
    function addApplicants(string _applicantName, string _applicantSex, string _applicantDOB, string _applicantAddress, int _ssn, int _applicantIncome) public {

        applicantName = _applicantName;
        applicantSex = _applicantSex;
        applicantDOB = _applicantDOB;
        homeFullAdd = ApplicantFullAddress(_applicantAddress);
        ssn = _ssn;
        applicantIncome = _applicantIncome;
    }

    function applicants(string _applicantName,
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
        //signedBy = msg.sender;
    }

    function findBySSN(int _ssn) public view returns (bool) {
        if (ssn == _ssn) {
            return true;
        }
        return false;
    }

    function ackApplication(string _name, address _lenderAddress) public {

        applicationDetails[msg.sender] = Application(_name, _lenderAddress, true, now);
        emit ApplicationAcknowledged(msg.sender);
        myApplications.push(msg.sender);
    }

       //add modified lenderCallOnly to restrict access ONLY to lender
    function getApplicantDetails() public view  returns(string, string, string, int, int) {
        return (applicantName, applicantSex, applicantDOB, ssn, applicantIncome);
    }

     //add modified lenderCallOnly to restrict access ONLY to lender
    function getApplicantAddress() public  view  returns(string, string, string, string, string, string) {
        return(homeAdd.street1, homeAdd.street2, homeAdd.city, homeAdd.zip, homeAdd.state, homeAdd.country);
    }
    
    function getApplicantFullAddress() public  view  returns(string) {
        return(homeFullAdd.fullAdress);
    }
}



//============================================================================
contract Loan {

    address public applicantContractAddress;
    string public loanType;
    int public loanAmount;
    uint public iLoanAmount;
    address public loanProgramAddress = msg.sender;
    bool public received;
    bool public goodCredit;
    bool public approved;
    event UpdatingCreditStatusFor(int ssn);
    event DisclosuresUpdated(int estimatedIntrestRate, int estimatedEMI);
    event LoanAmountTxfed(uint amount);
    event UpdatedUser(address signedBy);
    event userBalance(uint amount);
    event msgData(address msgInfo);
    int private ssn;
    int private applicantIncome;
    address private signedBy;
    int public estimatedIntrestRate;
    int public estimatedEMI;
    int public loanPeriodInYears;
    uint public lPiY;
	int public approvedLoanAmount;

    function getYears() pure public  {
//        return loanType;
}


    function Loan(string _name, address _applicantContract, string _type, int _amount, int _periodInYears) public {
        Applicant applicant =  Applicant(_applicantContract);
        applicant.ackApplication(_name, loanProgramAddress);
        (, , , ssn, applicantIncome) = applicant.getApplicantDetails();
        applicantContractAddress = _applicantContract;
        loanType = _type;
        loanAmount = _amount;
        iLoanAmount = uint(_amount);
        received = true;
        loanPeriodInYears = _periodInYears;
        signedBy = tx.origin;
    }

    function updateCreditStatus(bool _creditStatus) public {
        emit UpdatingCreditStatusFor(ssn);
        goodCredit = _creditStatus;
    }

    function addDisclosure(int _estimatedIntrestRate, int _estimatedEMI) public {
        estimatedIntrestRate = _estimatedIntrestRate;
        estimatedEMI = _estimatedEMI;
        emit DisclosuresUpdated(_estimatedIntrestRate, _estimatedEMI);

    }

    function approveLoan(int _approvedLoanAmount) public payable {
        if (goodCredit) {
			approvedLoanAmount = _approvedLoanAmount;
            emit msgData(tx.origin);
            emit userBalance(signedBy.balance);
            emit UpdatedUser(signedBy);
            signedBy.transfer(msg.value);
            approved = true;
            emit LoanAmountTxfed(msg.value);
        } else {
            revert();
        }
    }
    
}
